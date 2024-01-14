import type { TAccount, TPointReward } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { encode } from 'html-entities';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';

export default class TwitterDataProxy {
    static async getUser(account: TAccount) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/user`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data.user.data;
    }

    static async getUserId(account: TAccount) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        const token = data.connectedAccounts.find((token) => token.kind === AccessTokenKind.Twitter);
        if (!token) return;
        return token.userId;
    }

    static async getTwitter(sub: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${sub}/twitter`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return { isAuthorized: data.isAuthorized, tweets: data.tweets, users: data.users };
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

    static async validateUser(account: TAccount, reward: TPointReward) {
        const metadata = JSON.parse(reward.contentMetadata);
        const minFollowersCount = metadata.minFollowersCount ? Number(metadata.minFollowersCount) : 0;
        const user = await this.getUser(account);
        const followersCount = user.public_metrics.followers_count;
        if (followersCount >= minFollowersCount) return { result: true };

        return { result: false, reason: 'X: Your account has insufficient followers.' };
    }

    static async validateMessage(account: TAccount, message: string) {
        const now = Date.now();
        const start = new Date(now - 24 * 60 * 60 * 1000);
        const end = new Date(now);
        const [latestTweet] = await this.getLatestTweets(account.sub, start, end);
        if (!latestTweet) return { result: false, reason: `X: Could not find a post in the last 24 hours.` };

        const textA = String(latestTweet.text).toLowerCase().trim();
        const textB = encode(message).toLowerCase().trim();
        if (textA.includes(textB)) return { result: true, reason: '' };
        return { result: false, reason: `X: Your last post does not contain exactly "${message}".` };
    }

    static async validateLike(account: TAccount, channelItem: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/like/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data;
    }

    static async validateRetweet(account: TAccount, channelItem: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/retweet/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data;
    }

    static async validateFollow(account: TAccount, channelItem: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/twitter/follow/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data;
    }
}
