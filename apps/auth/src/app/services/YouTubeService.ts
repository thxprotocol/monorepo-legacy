import axios from 'axios';
import { google, youtube_v3 } from 'googleapis';
import { AccountDocument } from '../models/Account';
import { AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/secrets';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { parseJwt } from '../util/jwt';
import { logger } from '../util/logger';
import TokenService from './TokenService';
import { TokenDocument } from '../models/Token';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

const ERROR_NO_DATA = 'Could not find an youtube data for this accesstoken';

export class YouTubeService {
    static async isAuthorized(account: AccountDocument, kind: AccessTokenKind) {
        const token = await TokenService.getToken(account, kind);
        if (!token || !token.accessToken) return false;

        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const refreshToken = this.getRefreshToken(account);

                client.setCredentials({
                    refresh_token: refreshToken,
                    access_token: token.accessToken,
                });

                const res = await client.getAccessToken();
                const { expiry_date } = await client.getTokenInfo(res.token);

                await TokenService.setToken(account, {
                    kind,
                    accessToken: res.token,
                    refreshToken: refreshToken,
                    expiry: expiry_date,
                    userId: token.userId,
                });
            } catch {
                return false;
            }
        }

        const hasYoutubeScopes = await this.hasYoutubeScopes(token.accessToken, kind);
        if (!hasYoutubeScopes) return false;
        return true;
    }

    // TODO We should actually rethinkg the storage of those tokens and group them by provider
    // as we only get a refresh token once per provider. Currently this workaround should suffice.
    static getRefreshToken(account: AccountDocument) {
        const token = account.tokens.find(
            (t) => ['google', 'youtube-view', 'youtube-manage'].includes(t.kind) && t.refreshToken,
        );
        return token && token.refreshToken;
    }

    static async getYoutubeClient(account: AccountDocument, kind: AccessTokenKind) {
        const { accessToken } = await TokenService.getToken(account, kind);
        const refreshToken = this.getRefreshToken(account);

        client.setCredentials({
            refresh_token: refreshToken,
            access_token: accessToken,
        });

        const { token } = await client.getAccessToken();
        const { expiry_date } = await client.getTokenInfo(token);

        await TokenService.setToken(account, {
            kind: AccessTokenKind.YoutubeView,
            accessToken: token,
            refreshToken: refreshToken,
            expiry: expiry_date,
        });
        await account.save();

        return google.youtube({ version: 'v3' });
    }

    static async validateLike(account: AccountDocument, channelItem: string) {
        const youtube = await this.getYoutubeClient(account, AccessTokenKind.YoutubeManage);
        const r = await youtube.videos.getRating({
            id: [channelItem],
        });
        if (!r.data) {
            throw new Error(ERROR_NO_DATA);
        }
        return r.data.items.length ? r.data.items[0].rating == 'like' : false;
    }
    static async validateSubscribe(account: AccountDocument, channelItem: string) {
        const youtube = await this.getYoutubeClient(account, AccessTokenKind.YoutubeManage);
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
        const youtube = await this.getYoutubeClient(account, AccessTokenKind.YoutubeView);
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

        const youtube = await this.getYoutubeClient(account, AccessTokenKind.YoutubeView);
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

    static async hasYoutubeScopes(token: string, accessTokenKind: AccessTokenKind): Promise<boolean> {
        const youtubeScopes = this.getYoutubeScopes(accessTokenKind);
        const scopes = await YouTubeService.getScopesOfAccessToken(token);
        if (scopes.length !== youtubeScopes.length) {
            return false;
        }
        return youtubeScopes
            .map((x) => x.toLowerCase())
            .every((element) => {
                if (scopes.map((x) => x.toLowerCase()).includes(element)) {
                    return true;
                }
                return false;
            });
    }

    static async revokeAccess(account: AccountDocument, token: TokenDocument) {
        try {
            return await axios({
                url: `https://oauth2.googleapis.com/revoke?token=${token.accessToken}`,
                method: 'POST',
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static getLoginUrl(uid: string, scope: string[]) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        return client.generateAuthUrl({
            state,
            access_type: 'offline',
            scope,
        });
    }

    static async getTokens(code: string) {
        const { tokens } = await client.getToken(code);
        const expiry = tokens.expiry_date ? Date.now() + Number(tokens.expiry_date) * 1000 : undefined;

        let kind = YouTubeService.getAccessTokenKindFromScope(tokens.scope);
        if (!kind) kind = AccessTokenKind.Google;

        const claims = await parseJwt(tokens.id_token);
        return {
            kind,
            expiry,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            userId: claims.sub,
        };
    }

    static getYoutubeScopes(accessTokenKind: AccessTokenKind) {
        switch (accessTokenKind) {
            case AccessTokenKind.Google:
                return this.getBasicScopes();

            case AccessTokenKind.YoutubeView:
                return this.getYoutubeViewScopes();

            case AccessTokenKind.YoutubeManage:
                return this.getYoutubeManageScopes();
        }
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

    static getAccessTokenKindFromScope(scope: string) {
        if (!scope || !scope.length) {
            return undefined;
        }
        const joinChar = ' ';
        const openid = 'openid';
        const empty = '';
        scope = scope.replace(openid, empty).trim();

        if (scope === this.getBasicScopes().join(joinChar).replace(openid, empty).trim()) {
            return AccessTokenKind.Google;
        }
        if (scope === this.getYoutubeViewScopes().join(joinChar).replace(openid, empty).trim()) {
            return AccessTokenKind.YoutubeView;
        }
        if (scope === this.getYoutubeManageScopes().join(joinChar).replace(openid, empty).trim()) {
            return AccessTokenKind.YoutubeManage;
        }

        return undefined;
    }
}
