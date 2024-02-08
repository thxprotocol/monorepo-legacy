import { TAccount, TPointReward, TToken } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, OAuthRequiredScopes } from '@thxnetwork/common/lib/types/enums';
import { TwitterLike } from '../models/TwitterLike';
import { TwitterCursor } from '../models/TwitterCursor';
import { agenda } from '../util/agenda';
import { Job } from '@hokify/agenda';
import PoolService from '../services/PoolService';
import AccountProxy from '../proxies/AccountProxy';
import TwitterDataProxy from '../proxies/TwitterDataProxy';

export default class TwitterCacheService {
    static async cacheLikes(
        account: TAccount,
        quest: TPointReward,
        token: TToken,
        params: TTwitterRequestParams = { max_results: 100 },
    ) {
        const requirement = quest.interaction;
        const postId = quest.content;

        try {
            const data = await TwitterDataProxy.request(token, {
                url: `/tweets/${postId}/liking_users`,
                method: 'GET',
                params,
            });

            // Update all TwitterLikes found in the database
            await Promise.all(
                data.data.map(async (user: { id: string }) => {
                    return await TwitterLike.findOneAndUpdate(
                        { userId: user.id, postId },
                        { userId: user.id, postId },
                        { upsert: true },
                    );
                }),
            );

            // If there is a next_token, we store the next_token in case we get rate limited and
            // continue on the next page
            if (data.meta.next_token) {
                const nextToken = data.meta.next_token;

                // Update cursor with last used next_token
                await TwitterCursor.findByIdAndUpdate(
                    { postId, requirement },
                    { postId, requirement, nextToken },
                    { upsert: true },
                );

                // Start with caching the next 100 results
                return await this.cacheLikes(account, quest, token, {
                    ...params,
                    pagination_token: nextToken,
                });
            }

            // If there is no next_token, break out of the loop
            return { result: false, reason: 'X: Post has not been not liked.' };
        } catch (res) {
            // Check if we are failing due to a rate limit
            if (res.status === 429) {
                const pool = await PoolService.getById(quest.poolId);
                const owner = await PoolService.findOwner(pool);

                // If we are not using the owner token already we try again with the owner
                if (token.sub !== owner.sub) {
                    const token = await AccountProxy.getToken(
                        owner,
                        AccessTokenKind.Twitter,
                        OAuthRequiredScopes.TwitterValidateRepost,
                    );

                    return await this.cacheLikes(account, quest, token, params);
                } else {
                    // In case we're already using the pool owner account we schedule a job
                    // to retry the request in 15min and resumes caching from the last cursor.nextToken
                    await agenda.schedule('in 15 minutes', 'retry-validate-like', {
                        sub: account.sub,
                        questId: quest._id,
                    });

                    // If there is no next_token, break out of the loop
                    return { result: false, reason: 'X: Post has not been not liked.' };
                }
            }

            // Handle other errors
            return this.handleError(account, token, res);
        }
    }

    static async cacheLikesCallbackJob(job: Job) {
        const { attrs } = job;
        //
    }
}
