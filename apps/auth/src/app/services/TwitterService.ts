import CommonOauthLoginOptions from '@thxnetwork/auth/types/CommonOauthLoginOptions';
import { URLSearchParams } from 'url';
import { twitterClient } from '../util/axios';
import { AUTH_URL, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '../config/secrets';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/types/interfaces';

const ERROR_NO_DATA = 'Could not find an youtube data for this accesstoken';
const ERROR_NOT_AUTHORIZED = 'Not authorized for Twitter API';
const ERROR_TOKEN_REQUEST_FAILED = 'Failed to request access token';

export class TwitterService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Twitter);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const tokens = await this.refreshTokens(token.refreshToken);
                const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
                account.setToken({
                    kind: AccessTokenKind.Twitter,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiry,
                });
                await account.save();
            } catch (error) {
                return false;
            }
        }
        return true;
    }
    static async validateLike(accessToken: string, channelItem: string) {
        const user = await this.getUser(accessToken); // Should pass IAccessToken so we dont have to request the user here
        if (!user) throw new Error('Could not find Twitter user.');

        const maxResults = 100;
        let result = false,
            resultCount = maxResults,
            params = { max_results: maxResults };

        while (resultCount >= maxResults) {
            const { data } = await twitterClient({
                url: `/tweets/${channelItem}/liking_users`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params,
            });

            resultCount = data.meta.result_count;
            params = Object.assign(params, { pagination_token: data.meta.next_token });
            result = !!data.data.filter((u: { id: string }) => u.id === user.id).length;

            if (result) break;
            if (!data.meta.next_token) break;
        }

        return result;
    }

    static async validateRetweet(accessToken: string, channelItem: string) {
        const user = await this.getUser(accessToken);
        if (!user) throw new Error('Could not find Twitter user.');

        const r = await twitterClient({
            url: `/tweets/${channelItem}/retweeted_by`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data.data ? !!r.data.data.filter((u: { id: number }) => u.id === user.id).length : false;
    }

    static async validateFollow(accessToken: string, channelItem: string) {
        const user = await this.getUser(accessToken);
        if (!user) throw new Error('Could not find Twitter user.');

        const { data } = await twitterClient({
            url: `/users/${user.id}/following`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data: {
                target_user_id: channelItem,
            },
        });

        return data.data.following;
    }

    static async getUser(accessToken: string) {
        const { data } = await twitterClient({
            url: '/users/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data.data;
    }

    static async getLatestTweets(token: IAccessToken, startDate: Date, endDate: Date) {
        const { data } = await twitterClient({
            url: `/users/${token.userId}/tweets`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
            params: {
                'start_time': startDate.toISOString(),
                'end_time': endDate.toISOString(),
                'expansions': 'author_id',
                'user.fields': 'username',
            },
        });
        return data.data;
    }

    static async refreshTokens(refreshToken: string) {
        const data = new URLSearchParams();
        data.append('refresh_token', refreshToken);
        data.append('grant_type', 'refresh_token');
        data.append('client_id', TWITTER_CLIENT_ID);

        const r = await twitterClient({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64'),
            },
            data,
        });

        if (r.status !== 200) throw new Error(ERROR_TOKEN_REQUEST_FAILED);

        return r.data;
    }

    static async getTokens(code: string): Promise<{ tokenInfo: IAccessToken; email: string }> {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('client_id', TWITTER_CLIENT_ID);
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/twitter');
        body.append('code_verifier', 'challenge');

        const { data } = await twitterClient({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64'),
            },
            data: body,
        });
        const user = await this.getUser(data.access_token);
        const expiry = data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined;

        return {
            email: user.email,
            tokenInfo: {
                kind: AccessTokenKind.Twitter,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiry,
                userId: user.id,
                metadata: {
                    name: user.name,
                    username: user.username,
                },
            },
        };
    }

    static getScopes() {
        return ['tweet.read', 'users.read', 'like.read', 'follows.read', 'follows.write', 'offline.access'];
    }

    static getLoginURL(
        uid: string,
        { scope = this.getScopes(), redirectUrl = AUTH_URL + '/oidc/callback/twitter' }: CommonOauthLoginOptions,
    ) {
        const stateSerialized = JSON.stringify({ uid });
        const state = Buffer.from(stateSerialized).toString('base64');

        return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope.join(
            '%20',
        )}&code_challenge=challenge&code_challenge_method=plain&state=${state}`;
    }
}
