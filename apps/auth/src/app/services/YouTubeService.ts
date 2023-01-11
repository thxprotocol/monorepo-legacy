import axios from 'axios';
import { google, youtube_v3 } from 'googleapis';
import { AccountDocument } from '../models/Account';
import { AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/secrets';
import { AccessTokenKind } from '../types/enums/AccessTokenKind';
import { IAccessToken } from '../types/TAccount';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

const ERROR_NO_DATA = 'Could not find an youtube data for this accesstoken';

export class YouTubeService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Google);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) return false;
        const hasYoutubeScopes = await this.hasYoutubeScopes(token.accessToken);
        if (!hasYoutubeScopes) return false;
        return true;
    }

    static async getYoutubeClient(account: AccountDocument) {
        const googleToken: IAccessToken = account.getToken(AccessTokenKind.Google);
        client.setCredentials({
            refresh_token: googleToken.refreshToken,
            access_token: googleToken.accessToken,
        });

        const { token } = await client.getAccessToken();
        const { expiry_date } = await client.getTokenInfo(token);

        account.setToken({
            kind: AccessTokenKind.Google,
            accessToken: token,
            expiry: expiry_date,
            refreshToken: googleToken.refreshToken,
        });
        await account.save();

        return google.youtube({ version: 'v3' });
    }

    static async validateLike(account: AccountDocument, channelItem: string) {
        const youtube = await this.getYoutubeClient(account);

        const r = await youtube.videos.getRating({
            id: [channelItem],
        });

        if (!r.data) {
            throw new Error(ERROR_NO_DATA);
        }

        return r.data.items.length ? r.data.items[0].rating == 'like' : false;
    }

    static async validateSubscribe(account: AccountDocument, channelItem: string) {
        const youtube = await this.getYoutubeClient(account);
        const r = await youtube.subscriptions.list({
            forChannelId: channelItem,
            part: ['snippet'],
            mine: true,
        });

        if (!r.data) {
            throw new Error(ERROR_NO_DATA);
        }

        return r.data.items.length > 0;
    }

    static async getChannelList(account: AccountDocument) {
        const youtube = await this.getYoutubeClient(account);
        const r = await youtube.channels.list({
            part: ['snippet'],
            mine: true,
        });

        if (!r.data) {
            throw new Error(ERROR_NO_DATA);
        }

        if (!r.data.items?.length) {
            return [];
        }

        return r.data.items.map((item: any) => {
            return {
                id: item.id,
                title: item.snippet.title,
                thumbnailURI: item.snippet.thumbnails.default.url,
            };
        });
    }

    static async getVideoList(account: AccountDocument) {
        async function getChannels(youtube: youtube_v3.Youtube) {
            const r = await youtube.channels.list({
                part: ['contentDetails'],
                mine: true,
            });

            if (!r.data) {
                throw new Error(ERROR_NO_DATA);
            }

            return r.data;
        }

        async function getPlaylistItems(youtube: youtube_v3.Youtube, id: string) {
            const r = await youtube.playlistItems.list({
                playlistId: id,
                part: ['contentDetails'],
            });
            if (!r.data) {
                throw new Error(ERROR_NO_DATA);
            }
            return r.data.items;
        }

        async function getVideos(youtube: youtube_v3.Youtube, videoIds: string[]) {
            const r = await youtube.videos.list({
                id: videoIds,
                part: ['snippet'],
            });

            if (!r.data) {
                throw new Error(ERROR_NO_DATA);
            }

            return r.data.items;
        }

        const youtube = await this.getYoutubeClient(account);
        const channel = await getChannels(youtube);

        if (!channel.items?.length) {
            return [];
        }

        const uploadsChannelId = channel.items[0].contentDetails.relatedPlaylists.uploads;
        const playlistItems = await getPlaylistItems(youtube, uploadsChannelId);
        const videoIds = playlistItems.map((item: any) => item.contentDetails.videoId);
        const videos = videoIds.length ? await getVideos(youtube, videoIds) : [];

        return videos.map((item: any) => {
            return {
                id: item.id,
                title: item.snippet.title,
                tags: item.snippet.tags,
                thumbnailURI: item.snippet.thumbnails.default.url,
            };
        });
    }

    static async getScopesOfAccessToken(token: string): Promise<string[]> {
        try {
            const r = await axios({
                url: `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
            });
            return r.data['scope'].split(' ');
        } catch (error) {
            return [];
        }
    }

    static async hasYoutubeScopes(token: string): Promise<boolean> {
        const youtubeScopes = this.getYoutubeScopes();
        const scopes = await YouTubeService.getScopesOfAccessToken(token);
        return scopes.length === youtubeScopes.length;
    }

    static async revokeAccess(account: AccountDocument) {
        const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Google);
        if (!token) throw new Error('Could not find the token');

        const r = await axios({
            url: `https://oauth2.googleapis.com/revoke?token=${token.accessToken}`,
            method: 'POST',
        });

        if (r.status !== 200) throw new Error('Could not revoke access token');

        return r.data;
    }

    static getLoginUrl(uid: string, scope: string[]) {
        return client.generateAuthUrl({
            state: uid,
            access_type: 'offline',
            scope,
        });
    }

    static async getTokens(code: string) {
        const res = await client.getToken(code);
        return res.tokens;
    }

    static getBasicScopes() {
        return ['https://www.googleapis.com/auth/userinfo.email', 'openid'];
    }

    static getYoutubeViewScopes() {
        return ['https://www.googleapis.com/auth/youtube.readonly', 'openid'];
    }

    static getYoutubeManageScopes() {
        return ['https://www.googleapis.com/auth/youtube', 'openid'];
    }
}
