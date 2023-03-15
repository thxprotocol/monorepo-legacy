import type { IAccount } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

class NoTwitterDataError extends THXError {
    message = 'Could not find twitter data for this account';
}

export default class TwitterDataProxy {
    static async getUserId(account: IAccount) {
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
        params.append('startDate', startDate.getTime().toString());
        params.append('endDate', endDate.getTime().toString());
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/twitter/tweets/latest`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            params,
        });

        if (r.status !== 200) throw new NoTwitterDataError();
        if (!r.data) throw new NoTwitterDataError();

        return r.data;
    }

    static async validateLike(account: IAccount, channelItem: string) {
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

    static async validateRetweet(account: IAccount, channelItem: string) {
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

    static async validateFollow(account: IAccount, channelItem: string) {
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
