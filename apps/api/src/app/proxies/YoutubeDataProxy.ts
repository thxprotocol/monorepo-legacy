import type { TAccount } from '@thxnetwork/types/interfaces';
import { google } from 'googleapis';
import { AccessTokenKind, OAuthRequiredScopes, OAuthScope } from '@thxnetwork/common/lib/types';
import { AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/secrets';
import { getToken } from '../services/maps/quests';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

function getClient(account: TAccount, requiredScopes: OAuthScope[]) {
    const token = getToken(account, AccessTokenKind.Google, requiredScopes);
    client.setCredentials({
        access_token: token.accessToken,
        refresh_token: token.refreshToken,
    });
    return google.youtube({ version: 'v3' });
}

export default class YoutubeDataProxy {
    static async validateLike(account: TAccount, content: string, nextPageToken?: string) {
        const youtube = getClient(account, OAuthRequiredScopes.GoogleYoutubeLike);
        const { data } = await youtube.videos.list({
            part: ['snippet'],
            myRating: 'like',
            maxResults: 50,
            pageToken: nextPageToken,
        });

        const isLiked = data.items.find((item) => item.id === content);
        if (isLiked) return { result: true, reason: '' };

        if (data.nextPageToken) {
            return await this.validateLike(account, content, nextPageToken);
        }

        return { result: false, reason: 'YouTube: Could not find your like for this video.' };
    }

    static async validateSubscribe(account: TAccount, channelItem: string) {
        const youtube = getClient(account, OAuthRequiredScopes.GoogleYoutubeLike);
        const { data } = await youtube.subscriptions.list({
            forChannelId: channelItem,
            part: ['snippet'],
            mine: true,
        });
        const isSubscribed = data.items.length > 0;
        if (isSubscribed) return { result: true, reason: '' };

        return { result: false, reason: 'Could not find your subscription for this channel.' };
    }
}
