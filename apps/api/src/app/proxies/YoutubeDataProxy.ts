import { google } from 'googleapis';
import { AccessTokenKind, OAuthRequiredScopes, OAuthScope } from '@thxnetwork/common/enums';
import { AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/secrets';
import AccountProxy from './AccountProxy';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

async function getClient(account: TAccount, requiredScopes: OAuthScope[]) {
    const token = await AccountProxy.getToken(account, AccessTokenKind.Google, requiredScopes);
    client.setCredentials({
        access_token: token.accessToken,
        refresh_token: token.refreshToken,
    });
    return google.youtube({ version: 'v3' });
}

export default class YoutubeDataProxy {
    static async validateLike(account: TAccount, videoId: string, nextPageToken?: string) {
        const youtube = await getClient(account, OAuthRequiredScopes.GoogleYoutubeLike);
        const { data } = await youtube.videos.list({
            part: ['snippet'],
            myRating: 'like',
            maxResults: 50,
            pageToken: nextPageToken,
        });

        const isLiked = data.items.find((item) => item.id === videoId);
        if (isLiked) return { result: true, reason: '' };

        // NOTE Disabled paging as we hit rate limits when searching
        // through all liked videos of a user.
        // if (data.nextPageToken) {
        //     return await this.validateLike(account, content, nextPageToken);
        // }

        return { result: false, reason: 'YouTube: Could not find your like for this video.' };
    }

    static async validateSubscribe(account: TAccount, channelId: string) {
        const youtube = await getClient(account, OAuthRequiredScopes.GoogleYoutubeLike);
        const { data } = await youtube.subscriptions.list({
            forChannelId: channelId,
            part: ['snippet'],
            mine: true,
        });
        const isSubscribed = data.items.length > 0;
        if (isSubscribed) return { result: true, reason: '' };

        return { result: false, reason: 'Could not find your subscription for this channel.' };
    }
}
