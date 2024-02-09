import { TAccount, TPointReward, TToken, TTwitterRequestParams } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, JobType, OAuthRequiredScopes } from '@thxnetwork/common/lib/types/enums';
import { TwitterLike } from '../models/TwitterLike';
import { agenda } from '../util/agenda';
import { PointReward } from '../models/PointReward';
import { logger } from '../util/logger';
import { TJob } from '@thxnetwork/common/lib/types';
import { Job } from '@thxnetwork/api/models/Job';
import AccountProxy from '../proxies/AccountProxy';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
export default class TwitterCacheService {
    static async updateLikeCache(
        account: TAccount,
        quest: TPointReward,
        token: TToken,
        params: TTwitterRequestParams = { max_results: 100 },
    ) {
        const postId = quest.content;

        try {
            const data = await TwitterDataProxy.request(token, {
                url: `/tweets/${postId}/liking_users`,
                method: 'GET',
                params,
            });

            // If no results return early
            if (!data.meta.result_count) return;

            // If there are results, upsert all TwitterLikes into the database
            await Promise.all(
                data.data.map(async (user: { id: string }) => {
                    return await TwitterLike.findOneAndUpdate(
                        { userId: user.id, postId },
                        { userId: user.id, postId },
                        { upsert: true },
                    );
                }),
            );

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
            // Check if we are failing due to a rate limit
            if (res.status === 429) {
                const sub = account.sub;
                const questId = String(quest._id);
                const job = await Job.findOne({
                    'name': JobType.UpdateLikeCache,
                    'data.sub': sub,
                    'data.questId': questId,
                });

                if (!job) {
                    const resetTime = Number(res.headers['x-rate-limit-reset']);
                    const seconds = resetTime - Math.ceil(Date.now() / 1000);
                    const minutes = Math.ceil(seconds / 60);

                    // Resume caching when rate limit is reset
                    await agenda.schedule(`in ${minutes} minutes`, JobType.UpdateLikeCache, { sub, questId, params });

                    logger.info('Scheduled updateLikeCacheJob', { questId, sub, params });
                }
            }

            throw res;
        }
    }

    static async updateLikeCacheJob(job: TJob) {
        const { questId, sub, params } = job.attrs.data as {
            sub: string;
            questId: string;
            params: TTwitterRequestParams;
        };
        logger.info('Starting updateLikeCacheJob', { questId, sub, params });

        try {
            const quest = await PointReward.findById(questId);
            if (!quest) throw new Error(`No token found for questId ${questId}.`);

            const account = await AccountProxy.findById(sub);
            if (!account) throw new Error(`No account found for sub ${sub}.`);

            const token = await AccountProxy.getToken(
                account,
                AccessTokenKind.Twitter,
                OAuthRequiredScopes.TwitterValidateLike,
            );
            if (!token) throw new Error(`No token found for sub ${sub}.`);

            // Remove this job so it can be recreated if another rate limit is hit
            await job.remove();

            // Continue cache update for likes until the last page is reached
            // or the next rate limit is hit
            await this.updateLikeCache(account, quest, token, params);
        } catch (error) {
            logger.error(error.response ? error.response : error);
        }
    }
}
