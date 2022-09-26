import { URLSearchParams } from 'url';
import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { twitterClient } from '../util/axios';
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_REDIRECT_URI } from '../util/secrets';

const ERROR_NO_DATA = 'Could not find an youtube data for this accesstoken';
const ERROR_NOT_AUTHORIZED = 'Not authorized for Twitter API';
const ERROR_TOKEN_REQUEST_FAILED = 'Failed to request access token';

export class TwitterService {
    static async validateLike(accessToken: string, channelItem: string) {
        const user = await this.getUser(accessToken);
        if (!user) throw new Error('Could not find Twitter user.');

        const r = await twitterClient({
            url: `/users/${user.id}/liked_tweets?max_results=100&tweet.fields=id`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data.data ? !!r.data.data.filter((t: { id: string }) => t.id === channelItem).length : false;
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

        const r = await twitterClient({
            url: `/users/${channelItem}/followers`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data.data ? !!r.data.data.filter((u: { id: number }) => u.id === user.id).length : false;
    }

    static async getUser(accessToken: string) {
        const r = await twitterClient({
            url: '/users/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data.data;
    }

    static async getTweets(accessToken: string) {
        const user = await this.getUser(accessToken);
        if (!user) throw new Error('Could not find Twitter user.');
        const r = await twitterClient({
            url: `/users/${user.id}/tweets?tweet.fields=id,referenced_tweets,created_at`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data.data;
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

    static async requestTokens(code: string) {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('client_id', TWITTER_CLIENT_ID);
        body.append('redirect_uri', TWITTER_REDIRECT_URI);
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

        return data;
    }

    static getScopes() {
        return ['tweet.read', 'users.read', 'like.read', 'follows.read', 'offline.access'];
    }

    static getLoginURL(
        uid: string,
        { scope = this.getScopes(), redirectUrl = TWITTER_REDIRECT_URI }: CommonOauthLoginOptions,
    ) {
        return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope.join(
            '%20',
        )}&code_challenge=challenge&code_challenge_method=plain&state=${uid}`;
    }
}
