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

    static async searchTweets(sub: string, content: string) {
        const params = new URLSearchParams();
        params.append('hashtag', content);

        const { data } = await authClient({
            method: 'GET',
            url: `/account/${sub}/twitter/tweets/search`,
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
        const results = await this.searchTweets(account.sub, message);
        if (!results.length)
            return {
                result: false,
                reason: `X: Could not find a post matching the requirements for your account in the last 7 days.`,
            };

        return {
            result: true,
            reason: '',
        };
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
