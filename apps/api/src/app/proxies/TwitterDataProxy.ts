import type { TAccount } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

class NoTwitterDataError extends THXError {
    message = 'Could not find twitter data for this account';
}

export default class TwitterDataProxy {
    static async getUserId(account: TAccount) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/user`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data.userId;
    }

    static async getTwitter(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/twitter`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (r.status !== 200) throw new NoTwitterDataError();
        if (!r.data) throw new NoTwitterDataError();

        return { isAuthorized: r.data.isAuthorized, tweets: r.data.tweets, users: r.data.users };
    }

    static async getLatestTweets(sub: string, startDate: Date, endDate: Date) {
        const params = new URLSearchParams();
        params.append('startDate', String(startDate.getTime()));
        params.append('endDate', String(endDate.getTime()));

        const { data } = await authClient({
            method: 'GET',
            url: `/account/${sub}/twitter/tweets/latest`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            params,
        });
        return data;
    }

    static async validateMessage(account: TAccount, message: string) {
        const now = Date.now();
        const start = new Date(now - 24 * 60 * 60 * 1000);
        const end = new Date(now);
        const [latestTweet] = await this.getLatestTweets(account.sub, start, end);
        if (!latestTweet) return false;
        const textA = String(latestTweet.text).toLowerCase().trim();
        const textB = message.toLowerCase().trim();
        if (textA.includes(textB)) return true;

        return false;
    }

    static async validateLike(account: TAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/like/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoTwitterDataError();

        return r.data.result;
    }

    static async validateRetweet(account: TAccount, channelItem: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/retweet/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!data) throw new NoTwitterDataError();

        return data.result;
    }

    static async validateFollow(account: TAccount, channelItem: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/follow/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!data) throw new NoTwitterDataError();

        return data.result;
    }
}
