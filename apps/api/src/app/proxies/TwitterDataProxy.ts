import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TAccount, TPointReward, TToken } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, OAuthRequiredScopes, OAuthTwitterScope } from '@thxnetwork/common/lib/types/enums';
import { TWITTER_API_ENDPOINT } from '@thxnetwork/common/lib/types/contants';
import { formatDistance } from 'date-fns';
import { logger } from '../util/logger';
import { TwitterLike } from '../models/TwitterLike';
import { TwitterRepost } from '../models/TwitterRepost';
import { TwitterUser } from '../models/TwitterUser';
import TwitterCacheService from '../services/TwitterCacheService';
import AccountProxy from './AccountProxy';

async function twitterClient(config: AxiosRequestConfig) {
    const client = axios.create({ ...config, baseURL: TWITTER_API_ENDPOINT });
    return await client(config);
}

export default class TwitterDataProxy {
    static async getUserByUsername(account: TAccount, username: string) {
        const token = await AccountProxy.getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const data = await this.request(token, {
            method: 'GET',
            url: `/users/by/username/${username}`,
            params: {
                'user.fields': 'profile_image_url,public_metrics',
            },
        });

        return data.data;
    }

    static async getUser(account: TAccount, userId: string) {
        const token = await AccountProxy.getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        try {
            const data = await this.request(token, {
                method: 'GET',
                url: `/users/${userId}`,
                params: {
                    'user.fields': 'profile_image_url,public_metrics',
                },
            });

            // Cache TwitterUser
            await TwitterUser.findOneAndUpdate(
                { userId: data.data.id },
                {
                    userId: data.data.id,
                    profileImgUrl: data.data.profile_image_url,
                    name: data.data.name,
                    username: data.data.username,
                    publicMetrics: {
                        followersCount: data.data.public_metrics.followers_count,
                        followingCount: data.data.public_metrics.following_count,
                        tweetCount: data.data.public_metrics.tweet_count,
                        listedCount: data.data.public_metrics.listed_count,
                        likeCount: data.data.public_metrics.like_count,
                    },
                },
                { upsert: true },
            );

            return data.data;
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    static async getTweet(account: TAccount, tweetId: string) {
        const token = await AccountProxy.getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const data = await this.request(token, {
            method: 'GET',
            url: `/tweets`,
            params: {
                ids: tweetId,
                expansions: 'author_id',
            },
        });

        return { tweet: data.data[0], user: data.includes.users[0] };
    }

    static async searchTweets(account: TAccount, query: string) {
        const token = await AccountProxy.getToken(account, AccessTokenKind.Twitter, [
            OAuthTwitterScope.UsersRead,
            OAuthTwitterScope.TweetRead,
        ]);
        const startTime = new Date(Date.now() - 60 * 60 * 24).toISOString(); // 24h ago
        const data = await this.request(token, {
            url: '/tweets/search/recent',
            method: 'GET',
            params: {
                query: `from:${token.userId} ${query}`,
                start_time: startTime,
            },
        });
        return data.data;
    }

    static async validateUser(account: TAccount, quest: TPointReward) {
        const token = await AccountProxy.getToken(
            account,
            AccessTokenKind.Twitter,
            OAuthRequiredScopes.TwitterValidateUser,
        );
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        const metadata = JSON.parse(quest.contentMetadata);
        const minFollowersCount = metadata.minFollowersCount ? Number(metadata.minFollowersCount) : 0;

        try {
            const user = await this.getUser(account, token.userId);

            // Validate the follower count for this user
            const followersCount = user.public_metrics.followers_count;
            if (followersCount >= minFollowersCount) return { result: true, reason: '' };

            return {
                result: false,
                reason: `X: Your account does not meet the threshold of ${minFollowersCount} followers.`,
            };
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    static async validateFollow(account: TAccount, userId: string) {
        const token = await AccountProxy.getToken(
            account,
            AccessTokenKind.Twitter,
            OAuthRequiredScopes.TwitterValidateFollow,
        );
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };
        try {
            if (token.userId === userId) {
                return { result: false, reason: 'X: Can not validate a follow for your account with your account.' };
            }

            const data = await this.request(token, {
                url: `/users/${token.userId}/following`,
                method: 'POST',
                data: {
                    target_user_id: userId,
                },
            });

            // TODO Cache TwitterFollower here if isFollowing is true
            // TODO Create migration to build follower cache based on existing TwitterFollow quest entries

            const isFollowing = data.data.following;
            if (isFollowing) return { result: true, reason: '' };

            return { result: false, reason: 'X: Account is not found as a follower.' };
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    static async validateLike(account: TAccount, quest: TPointReward) {
        const postId = quest.content;
        const token = await AccountProxy.getToken(
            account,
            AccessTokenKind.Twitter,
            OAuthRequiredScopes.TwitterValidateLike,
        );
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        // Search for TwitterLikes with this userId and postId in the cache
        const like = await TwitterLike.findOne({ userId: token.userId, postId });
        if (like) return { result: true, reason: '' };

        try {
            // No cache result means we should update the cache.
            await TwitterCacheService.updateLikeCache(account, quest, token);

            // Search the database again after cache update
            const like = await TwitterLike.findOne({ userId: token.userId, postId });
            if (like) return { result: true, reason: '' };

            // Fail if nothing is found
            return { result: false, reason: 'X: Post has not been not liked.' };
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    static async validateRetweet(account: TAccount, quest: TPointReward) {
        const postId = quest.content;
        const token = await AccountProxy.getToken(
            account,
            AccessTokenKind.Twitter,
            OAuthRequiredScopes.TwitterValidateRepost,
        );
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };

        // Query cached TwitterReposts for this tweetId and userId
        const repost = await TwitterRepost.findOne({ userId: token.userId, postId });
        if (repost) return { result: true, reason: '' };

        try {
            // No cache result means we should update the cache.
            await TwitterCacheService.updateRepostCache(account, quest, token);

            // Search the database again after cache update
            const repost = await TwitterRepost.findOne({ userId: token.userId, postId });
            if (repost) return { result: true, reason: '' };

            // Fail if nothing is found
            return { result: false, reason: 'X: Post has not been not reposted.' };
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    static async validateMessage(account: TAccount, message: string) {
        const token = await AccountProxy.getToken(
            account,
            AccessTokenKind.Twitter,
            OAuthRequiredScopes.TwitterValidateMessage,
        );
        if (!token) return { result: false, reason: 'Could not find an X connection for this account.' };
        try {
            const query = this.parseSearchQuery(message);
            const results = await this.searchTweets(account, query);
            if (results.length) return { result: true, reason: '' };

            return {
                result: false,
                reason: `X: Could not find a post matching the requirements for your account in the last 7 days.`,
            };
        } catch (res) {
            return this.handleError(account, token, res);
        }
    }

    static async request(token: TToken, config: AxiosRequestConfig) {
        try {
            const { data } = await twitterClient({
                ...config,
                headers: { Authorization: `Bearer ${token.accessToken}` },
            });
            return data;
        } catch (error) {
            if (error.response) {
                // Rethrow if this is an axios error
                throw error.response;
            } else {
                logger.error(error);
            }
        }
    }

    static async handleError(account: TAccount, token: TToken, res: AxiosResponse) {
        if (res.status === 429) {
            logger.info(`[429] X-RateLimit is hit by account ${account.sub} with X UserId ${token.userId}.`);
            return this.handleRateLimitError(res);
        }

        if (res.status === 401) {
            logger.info(`[401] Token for ${account.sub} with X UserId ${token.userId} is invalid and disconnected.`);
            await AccountProxy.disconnect(account, token.kind);
            return { result: false, reason: 'Your X account connection has been removed, please reconnect!' };
        }

        if (res.status === 403) {
            logger.info(`[403] Token for ${account.sub} with X UserId ${token.userId} has insufficient permissions.`);
            return { result: false, reason: 'Your X account access level is insufficient, please reconnect!' };
        }

        logger.error(res);

        return { result: false, reason: 'X: An unexpected issue occured during your request.' };
    }

    private static handleRateLimitError(res: AxiosResponse) {
        const limit = res.headers['x-rate-limit-limit'];
        const resetTime = Number(res.headers['x-rate-limit-reset']);
        const seconds = resetTime - Math.ceil(Date.now() / 1000);

        return {
            result: false,
            reason: `X allows for a max of ${limit} searches per 15 minute. We will continue searching in ${formatDistance(
                0,
                seconds * 1000,
                { includeSeconds: true },
            )}. Come back later to complete your quest!`,
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
