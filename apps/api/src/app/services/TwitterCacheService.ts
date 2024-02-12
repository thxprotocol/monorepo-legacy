import { TAccount, TPointReward, TToken, TTwitterRequestParams } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, JobType, OAuthRequiredScopes, OAuthTwitterScope } from '@thxnetwork/common/lib/types/enums';
import { TwitterLike } from '../models/TwitterLike';
import { agenda } from '../util/agenda';
import { PointReward } from '../models/PointReward';
import { logger } from '../util/logger';
import { TJob } from '@thxnetwork/common/lib/types';
import { Job } from '../models/Job';
import AccountProxy from '../proxies/AccountProxy';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import { TwitterRepost } from '../models/TwitterRepost';
import { AxiosResponse } from 'axios';
export default class TwitterCacheService {
    static async updateRepostCache(
        account: TAccount,
        quest: TPointReward,
        token: TToken,
        params: TTwitterRequestParams = { max_results: 100 },
    ) {
        const postId = quest.content;
        try {
            logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} Repost verification calls X API.`);
            const data = await TwitterDataProxy.request(token, {
                url: `/tweets/${postId}/retweeted_by`,
                method: 'GET',
                params,
            });
            logger.info(`Fetched ${data.meta.result_count} reposts from X.`);

            // If no results return early
            if (!data.meta.result_count) return;

            const userIds = data.data.map((user: { id: string }) => user.id);
            const cachedReposts = await TwitterRepost.find({ userId: { $in: userIds }, postId });
            const newReposts = userIds.filter(
                (userId: string) => !cachedReposts.map((like) => like.userId).includes(userId),
            );

            // If there are new reposting users on a page where we have already cached some likes
            // then we need to cache the new users and return early
            if (newReposts.length) {
                const operations = data.data
                    .filter((user: { id: string }) => newReposts.includes(user.id))
                    .map((user) => ({
                        updateOne: {
                            filter: { userId: user.id, postId },
                            update: { userId: user.id, postId },
                            upsert: true,
                        },
                    }));

                await TwitterLike.bulkWrite(operations);
            }

            // If one of the userIds is already in the db we consider the
            // cache up to date and we return early
            if (cachedReposts.length) return;

            // If not then we upsert all TwitterReposts into the database
            const operations = data.data.map((user: { id: string }) => ({
                updateOne: {
                    filter: { userId: user.id, postId },
                    update: { userId: user.id, postId },
                    upsert: true,
                },
            }));
            await TwitterRepost.bulkWrite(operations);

            // If there is a next_token, we store the next_token in case we get rate limited
            // and continue on the next page
            if (data.meta.next_token) {
                // Start with caching the next 100 results
                await this.updateRepostCache(account, quest, token, {
                    ...params,
                    pagination_token: data.meta.next_token,
                });
            }
        } catch (res) {
            await this.handleRateLimitError(res, account, quest, params, JobType.UpdateTwitterRepostCache);
        }
    }

    static async updateLikeCache(
        account: TAccount,
        quest: TPointReward,
        token: TToken,
        params: TTwitterRequestParams = { max_results: 100 },
    ) {
        const postId = quest.content;

        try {
            logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} Like verification calls X API.`);
            const data = await TwitterDataProxy.request(token, {
                url: `/tweets/${postId}/liking_users`,
                method: 'GET',
                params,
            });
            logger.info(`Fetched ${data.meta.result_count} likes from X.`);

            // If no results return early
            if (!data.meta.result_count) return;

            const userIds = data.data.map((user: { id: string }) => user.id);
            const cachedLikes = await TwitterLike.find({ userId: { $in: userIds }, postId });
            const newLikes = userIds.filter(
                (userId: string) => !cachedLikes.map((like) => like.userId).includes(userId),
            );

            // If there are new liking users on a page where we have already cached some likes
            // then we need to cache the new users and return early
            if (newLikes.length) {
                const operations = data.data
                    .filter((user: { id: string }) => newLikes.includes(user.id))
                    .map((user) => ({
                        updateOne: {
                            filter: { userId: user.id, postId },
                            update: { userId: user.id, postId },
                            upsert: true,
                        },
                    }));

                await TwitterLike.bulkWrite(operations);
            }
            // If one of the userIds is already in the db we consider the
            // cache up to date and we return early
            if (cachedLikes.length) return;

            // If not then we upsert all TwitterLikes into the database
            const operations = data.data.map((user: { id: string }) => ({
                updateOne: {
                    filter: { userId: user.id, postId },
                    update: { userId: user.id, postId },
                    upsert: true,
                },
            }));
            await TwitterLike.bulkWrite(operations);

            // If there is a next_token, we store the next_token in case we get rate limited
            // and continue on the next page
            if (data.meta.next_token) {
                // Start with caching the next 100 results
                await this.updateLikeCache(account, quest, token, {
                    ...params,
                    pagination_token: data.meta.next_token,
                });
            }
        } catch (res) {
            await this.handleRateLimitError(res, account, quest, params, JobType.UpdateTwitterLikeCache);
        }
    }

    static async handleRateLimitError(
        res: AxiosResponse,
        account: TAccount,
        quest: TPointReward,
        params: TTwitterRequestParams,
        jobType: JobType,
    ) {
        // Retrow the error if it's not a rate limit error
        if (res.status === 429) {
            const sub = account.sub;
            const questId = String(quest._id);
            const job = await Job.findOne({
                'name': jobType,
                'data.sub': sub,
                'data.questId': questId,
            });

            if (!job) {
                const resetTime = Number(res.headers['x-rate-limit-reset']);
                const seconds = resetTime - Math.ceil(Date.now() / 1000);
                const minutes = Math.ceil(seconds / 60);

                // Resume caching when rate limit is reset
                await agenda.schedule(`in ${minutes} minutes`, jobType, {
                    sub,
                    questId,
                    params,
                });

                logger.info('Scheduled updateLikeCacheJob', { questId, sub, params });
            }
        }

        throw res;
    }

    static async updateRepostCacheJob(job: TJob) {
        await this.updateCacheJob(job, OAuthRequiredScopes.TwitterValidateRepost, this.updateRepostCache);
    }

    static async updateLikeCacheJob(job: TJob) {
        await this.updateCacheJob(job, OAuthRequiredScopes.TwitterValidateLike, this.updateLikeCache);
    }

    static async updateCacheJob(
        job: TJob,
        scopes: OAuthTwitterScope[],
        updateCacheCallback: (
            account: TAccount,
            quest: TPointReward,
            token: TToken,
            params: TTwitterRequestParams,
        ) => Promise<void>,
    ) {
        const { questId, sub, params } = job.attrs.data as {
            sub: string;
            questId: string;
            params: TTwitterRequestParams;
        };
        logger.info(`Starting ${job.attrs.name}`, params);

        try {
            const quest = await PointReward.findById(questId);
            if (!quest) throw new Error(`No token found for questId ${questId}.`);

            const account = await AccountProxy.findById(sub);
            if (!account) throw new Error(`No account found for sub ${sub}.`);

            const token = await AccountProxy.getToken(account, AccessTokenKind.Twitter, scopes);
            if (!token) throw new Error(`No token found for sub ${sub}.`);

            // Remove this job so it can be recreated if another rate limit is hit
            await job.remove();

            // Continue cache update for likes or reposts until the last page is reached
            // or the next rate limit is hit
            await updateCacheCallback(account, quest, token, params);
        } catch (error) {
            logger.error(error.response ? error.response : error);
        }
    }
}
