import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TAccount, TPointReward, TToken } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, OAuthRequiredScopes, OAuthTwitterScope } from '@thxnetwork/common/lib/types/enums';
import { TWITTER_API_ENDPOINT } from '@thxnetwork/common/lib/types/contants';
import { formatDistance } from 'date-fns';
import { getToken } from '../services/maps/quests';
import AccountProxy from './AccountProxy';
import { logger } from '../util/logger';

async function twitterClient(config: AxiosRequestConfig) {
    try {
        const client = axios.create({ ...config, baseURL: TWITTER_API_ENDPOINT });
        return await client(config);
    } catch (error) {
        throw error.response;
    }
}

export default class TwitterDataProxy {
    static async getUserByUsername(account: TAccount, username: string) {
        const token = getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const data = await this.request(account, token, {
            method: 'GET',
            url: `/users/by/username/${username}`,
            params: {
                'user.fields': 'profile_image_url,public_metrics',
            },
        });

        return data.data;
    }

    static async getUser(account: TAccount, userId: string) {
        const token = getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const data = await this.request(account, token, {
            method: 'GET',
            url: `/users/${userId}`,
            params: {
                'user.fields': 'profile_image_url,public_metrics',
            },
        });

        // TODO Store TwitterUser
        // await TwitterUser.findOneAndUpdate(
        //     { userId: data.data.id },
        //     { userId: data.data.id, publicMetrics: data.data.public_metrics },
        // );

        return data.data;
    }

    static async getTweet(account: TAccount, tweetId: string) {
        const token = getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        // TODO Store TwitterPost
        // await TwitterPost.findOneAndUpdate(
        //     { userId: data.data.id },
        //     { userId: data.data.id, ...content },
        // );

        const data = await this.request(account, token, {
            method: 'GET',
            url: `/tweets`,
            params: {
                ids: tweetId,
                expansions: 'author_id',
            },
        });

        return { tweet: data.data[0], user: data.includes.users[0] };
    }

    static async validateLike(account: TAccount, tweetId: string, nextPageToken?: string) {
        const token = getToken(account, AccessTokenKind.Twitter, OAuthRequiredScopes.TwitterValidateLike);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        // TODO Query cached TwitterLikes for this tweetId and userId
        // const like = await TwitterLike.findOne({ userId: token.userId, tweetId });
        // if (like) return { result: true, reason: '' };

        // Not found? Search for it and cache results along the way
        const data = await this.request(account, token, {
            url: `/tweets/${tweetId}/liking_users`,
            method: 'GET',
            params: {
                max_results: 100,
                pagination_token: nextPageToken,
            },
        });

        // TODO Cache TwitterLike
        // await Promise.all(
        //     data.data.map(async (post) => {
        //         return await TwitterLike.findOneAndUpdate(
        //             { userId: post.userId, tweetId: post.id },
        //             { userId: post.userId, tweetId: post.id },
        //         );
        //     }),
        // );

        // Check if the user is liked in the current set of data
        const isLiked = data.data ? !!data.data.find((u) => u.id === token.userId) : false;
        if (isLiked) {
            return { result: true, reason: '' };
        }

        // If user is liked or there is no next_token, break out of the loop
        if (data.meta.next_token) {
            return await this.validateLike(account, tweetId, data.meta.next_token);
        }

        return { result: false, reason: 'X: Post has not been not liked.' };
    }

    static async searchTweets(account: TAccount, query: string) {
        const token = getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        const startTime = new Date(Date.now() - 60 * 60 * 24).toISOString(); // 24h ago
        const { data } = await twitterClient({
            url: '/tweets/search/recent',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
            params: {
                query: `from:${token.userId} ${query}`,
                start_time: startTime,
            },
        });
        return data.data;
    }

    static async validateRetweet(account: TAccount, channelItem: string, nextPageToken?: string) {
        const token = getToken(account, AccessTokenKind.Twitter, OAuthRequiredScopes.TwitterValidateRepost);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const data = await this.request(account, token, {
            url: `/tweets/${channelItem}/retweeted_by`,
            method: 'GET',
            params: {
                max_results: 100,
                pagination_token: nextPageToken,
            },
        });

        // Check if the user is liked in the current set of data
        const isReposted = data.data ? !!data.data.find((u: { id: string }) => u.id === token.userId) : false;

        // If user has reposted or there is no next_token, break out of the loop
        if (isReposted) {
            return { result: true, reason: '' };
        }

        if (!data.meta.next_token) {
            return await this.validateRetweet(account, channelItem, nextPageToken);
        }

        return { result: false, reason: 'X: Post has not been reposted.' };
    }

    static async validateFollow(account: TAccount, userId: string) {
        const token = getToken(account, AccessTokenKind.Twitter, OAuthRequiredScopes.TwitterValidateFollow);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };
        if (token.userId === userId) {
            return { result: false, reason: 'X: Can not validate a follow for your account with your account.' };
        }

        const data = await this.request(account, token, {
            url: `/users/${token.userId}/following`,
            method: 'POST',
            data: {
                target_user_id: userId,
            },
        });

        const isFollowing = data.data.following;
        if (isFollowing) return { result: true, reason: '' };

        return { result: false, reason: 'X: Account is not found as a follower.' };
    }

    static async validateUser(account: TAccount, reward: TPointReward) {
        const token = getToken(account, AccessTokenKind.Twitter, OAuthRequiredScopes.TwitterValidateUser);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const user = await this.getUser(account, token.userId);
        const metadata = JSON.parse(reward.contentMetadata);
        const minFollowersCount = metadata.minFollowersCount ? Number(metadata.minFollowersCount) : 0;
        const followersCount = user.public_metrics.followers_count;
        if (followersCount >= minFollowersCount) return { result: true, reason: '' };

        return {
            result: false,
            reason: `X: Your account does not meet the threshold of ${minFollowersCount} followers.`,
        };
    }

    static async validateMessage(account: TAccount, message: string) {
        const query = this.parseSearchQuery(message);
        const results = await this.searchTweets(account, query);
        if (results.length) return { result: true, reason: '' };

        return {
            result: false,
            reason: `X: Could not find a post matching the requirements for your account in the last 7 days.`,
        };
    }

    private static async request(account: TAccount, token: TToken, config: AxiosRequestConfig) {
        try {
            const { data } = await twitterClient({
                ...config,
                headers: { Authorization: `Bearer ${token.accessToken}` },
            });
            return data;
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    private static async handleError(account: TAccount, token: TToken, res: AxiosResponse) {
        logger.error(res);

        if (res.status === 429) {
            return this.handleRateLimitError(res);
        }

        if (res.status === 401) {
            await AccountProxy.disconnect(account, token.kind);
            return { result: false, reason: 'X: Your connection has been removed, please reconnect!' };
        }

        return { result: false, reason: 'X: An unexpected issue occured during your request.' };
    }

    private static handleRateLimitError(res: AxiosResponse) {
        const limit = res.headers['x-rate-limit-limit'];
        const resetTime = Number(res.headers['x-rate-limit-reset']);
        const seconds = resetTime - Math.ceil(Date.now() / 1000);

        return {
            result: false,
            reason: `X API allows for a max of ${limit} requests within a 15 minute window. Try again in ${formatDistance(
                0,
                seconds * 1000,
                { includeSeconds: true },
            )}.`,
        };
    }

    private static parseSearchQuery(content: string) {
        const emojiRegex = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu;
        return content
            .split(emojiRegex)
            .filter((text) => text && text.length > 1 && !text.match(emojiRegex))
            .map((text) => `"${text}"`)
            .join(' ');
    }
}
