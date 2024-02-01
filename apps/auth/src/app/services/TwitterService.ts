import CommonOauthLoginOptions from '@thxnetwork/auth/types/CommonOauthLoginOptions';
import { URLSearchParams } from 'url';
import { twitterClient } from '../util/axios';
import { AUTH_URL, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '../config/secrets';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/types/interfaces';
import { formatDistance } from 'date-fns';
import { AxiosResponse } from 'axios';
import { logger } from '../util/logger';

export class TwitterService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Twitter);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const tokens = await this.refreshTokens(token.refreshToken);
                const user = await this.getMe(tokens.access_token);
                const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
                account.setToken({
                    kind: AccessTokenKind.Twitter,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiry,
                    userId: user.id,
                    metadata: {
                        name: user.name,
                        username: user.username,
                    },
                });
                await account.save();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    static async getUserByUsername(account: AccountDocument, username: string) {
        const { accessToken } = account.getToken(AccessTokenKind.Twitter);
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

    static async getUser(account: AccountDocument, userId: string) {
        const { accessToken } = account.getToken(AccessTokenKind.Twitter);
        const { data } = await twitterClient({
            method: 'GET',
            url: `/users/${userId}`,
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                'user.fields': 'profile_image_url,public_metrics',
            },
        });
        return data;
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

    static async getTweet(account: AccountDocument, tweetId: string) {
        const token = account.getToken(AccessTokenKind.Twitter);
        if (!token) return { result: false, reason: 'Could not find an X access_token for this account.' };

        try {
            const res = await twitterClient({
                method: 'GET',
                url: `/tweets`,
                headers: { Authorization: `Bearer ${token.accessToken}` },
                params: {
                    ids: tweetId,
                    expansions: 'author_id',
                },
            });
            return res.data;
        } catch (res) {
            // Indicates rate limit has been hit
            if (res.status === 401) {
                await this.isAuthorized(account);
            }
            if (res.status === 429) {
                return this.handleRateLimitError(res);
            }
        }
    }

    static async validateLike(account: AccountDocument, channelItem: string) {
        const token = account.getToken(AccessTokenKind.Twitter);
        if (!token) return { result: false, reason: 'Could not find an X access_token for this account.' };

        const maxResults = 100,
            isValidating = true;
        let isLiked = false,
            params: { max_results: number; pagination_token?: string } = { max_results: maxResults };

        while (isValidating) {
            try {
                const { data } = await twitterClient({
                    url: `/tweets/${channelItem}/liking_users`,
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token.accessToken}` },
                    params,
                });

                // Determine if it should request again
                isValidating == !!data.meta.next_token;

                // Check if the user is liked in the current set of data
                isLiked = data.data ? !!data.data.find((u) => u.id === token.userId) : false;

                // If user is liked or there is no next_token, break out of the loop
                if (isLiked) {
                    return { result: true };
                }

                if (!data.meta.next_token) {
                    return { result: false, reason: 'X: Post has not been not liked.' };
                }

                // Update params for the next iteration
                params = { max_results: maxResults, pagination_token: data.meta.next_token };
            } catch (res) {
                logger.error(res);
                // Indicates rate limit has been hit
                if (res.status === 401) {
                    await this.isAuthorized(account);
                }
                if (res.status === 429) {
                    return this.handleRateLimitError(res);
                }
                return { result: false, reason: 'X: An unexpected issue occured during your validation request.' };
            }
        }

        return { result: true };
    }

    static async validateRetweet(account: AccountDocument, channelItem: string) {
        const token = account.getToken(AccessTokenKind.Twitter);
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
                    return { result: true };
                }

                if (!data.meta.next_token) {
                    return { result: false, reason: 'X: Post has not been reposted.' };
                }

                // Update params for the next iteration
                params = { max_results: maxResults, pagination_token: data.meta.next_token };
            } catch (res) {
                logger.error(res);
                // Indicates rate limit has been hit
                if (res.status === 401) {
                    await this.isAuthorized(account);
                }
                if (res.status === 429) {
                    return this.handleRateLimitError(res);
                }
                return { result: false, reason: 'X: An unexpected issue occured during your validation request.' };
            }
        }

        return { result: true };
    }

    static async validateFollow(account: AccountDocument, channelItem: string) {
        const token = account.getToken(AccessTokenKind.Twitter);
        if (!token) return { result: false, reason: 'Could not find an X access_token for this account.' };
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
            return { result: true };
        } catch (res) {
            logger.error(res);
            // Indicates rate limit has been hit
            if (res.status === 401) {
                await this.isAuthorized(account);
            }
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

    static async searchTweets(token: IAccessToken, query: string) {
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
        const user = await this.getMe(data.access_token);
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
