import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { TAccount, TPointReward } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';
import { TWITTER_API_ENDPOINT } from '@thxnetwork/common/lib/types/contants';
import { formatDistance } from 'date-fns';

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
        const { accessToken } = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
        const { data } = await twitterClient({
            method: 'GET',
            url: `/users/by/username/${username}`,
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                'user.fields': 'profile_image_url,public_metrics',
            },
        });
        return data;
    }

    static async getUser(account: TAccount, userId: string) {
        const { accessToken } = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
        const { data } = await twitterClient({
            method: 'GET',
            url: `/users/${userId}`,
            headers: { Authorization: `Bearer ${accessToken}` },
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

    static handleRateLimitError(res: AxiosResponse) {
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

    static async getTweet(account: TAccount, tweetId: string) {
        const { accessToken } = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);

        try {
            const { data } = await twitterClient({
                method: 'GET',
                url: `/tweets`,
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    ids: tweetId,
                    expansions: 'author_id',
                },
            });

            // TODO Store TwitterUser
            // await TwitterPost.findOneAndUpdate(
            //     { userId: data.data.id },
            //     { userId: data.data.id, publicMetrics: data.data.public_metrics },
            // );

            return data.data;
        } catch (res) {
            if (res.status === 429) {
                return this.handleRateLimitError(res);
            }
        }
    }

    static async validateLike(account: TAccount, tweetId: string) {
        const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
        if (!token) return { result: false, reason: 'Could not find an X access_token for this account.' };

        // TODO Query cached TwitterLikes for this tweetId and userId
        // const like = await TwitterLike.findOne({ userId: token.userId, tweetId });
        // if (like) return { result: true, reason: '' };

        // Not found? Search for it and cache results along the way
        const maxResults = 100,
            isValidating = true;
        let isLiked = false,
            params: { max_results: number; pagination_token?: string } = { max_results: maxResults };

        while (isValidating) {
            try {
                const { data } = await twitterClient({
                    url: `/tweets/${tweetId}/liking_users`,
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token.accessToken}` },
                    params,
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

                // Determine if it should request again
                isValidating == !!data.meta.next_token;

                // Check if the user is liked in the current set of data
                isLiked = data.data ? !!data.data.find((u) => u.id === token.userId) : false;

                // If user is liked or there is no next_token, break out of the loop
                if (isLiked) {
                    return { result: true, reason: '' };
                }

                if (!data.meta.next_token) {
                    return { result: false, reason: 'X: Post has not been not liked.' };
                }

                // Update params for the next iteration
                params = { max_results: maxResults, pagination_token: data.meta.next_token };
            } catch (res) {
                if (res.status === 429) {
                    return this.handleRateLimitError(res);
                }
                return { result: false, reason: 'X: An unexpected issue occured during your validation request.' };
            }
        }

        return { result: true, reason: '' };
    }

    static async validateRetweet(account: TAccount, channelItem: string) {
        const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
        if (!token) return { result: false, reason: 'Could not find an X access_token for this account.' };

        const maxResults = 100,
            isValidating = true;
        let isReposted = false,
            params: { max_results: number; pagination_token?: string } = { max_results: maxResults };

        while (isValidating) {
            try {
                const { data } = await twitterClient({
                    url: `/tweets/${channelItem}/retweeted_by`,
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token.accessToken}` },
                    params,
                });

                // Determine if it should request again
                isValidating == !!data.meta.next_token;

                // Check if the user is liked in the current set of data
                isReposted = data.data ? !!data.data.find((u: { id: string }) => u.id === token.userId) : false;

                // If user has reposted or there is no next_token, break out of the loop
                if (isReposted) {
                    return { result: true, reason: '' };
                }

                if (!data.meta.next_token) {
                    return { result: false, reason: 'X: Post has not been reposted.' };
                }

                // Update params for the next iteration
                params = { max_results: maxResults, pagination_token: data.meta.next_token };
            } catch (res) {
                if (res.status === 429) {
                    return this.handleRateLimitError(res);
                }
                return { result: false, reason: 'X: An unexpected issue occured during your validation request.' };
            }
        }

        return { result: true, reason: '' };
    }

    static async validateFollow(account: TAccount, channelItem: string) {
        const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
        try {
            const { data } = await twitterClient({
                url: `/users/${token.userId}/following`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
                data: {
                    target_user_id: channelItem,
                },
            });
            const isFollowing = data.data.following;
            if (!isFollowing) return { result: false, reason: 'X: Account is not found as a follower.' };
            return { result: true, reason: '' };
        } catch (res) {
            if (res.status === 429) {
                return this.handleRateLimitError(res);
            }
            return { result: false, reason: 'X: An unexpected issue occured during your validation request.' };
        }
    }

    static async getMe(accessToken: string) {
        const { data } = await twitterClient({
            url: '/users/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data.data;
    }

    static async searchTweets(account: TAccount, query: string) {
        const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
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

    static parseSearchQuery(content: string) {
        const emojiRegex = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu;
        return content
            .split(emojiRegex)
            .filter((text) => text && text.length > 1 && !text.match(emojiRegex))
            .map((text) => `"${text}"`)
            .join(' ');
    }

    static async validateUser(account: TAccount, reward: TPointReward) {
        const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Twitter);
        const metadata = JSON.parse(reward.contentMetadata);
        const minFollowersCount = metadata.minFollowersCount ? Number(metadata.minFollowersCount) : 0;
        const user = await this.getUser(account, token.userId);
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
}
