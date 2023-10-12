import { PointReward } from '../models/PointReward';
import { AssetPool } from '../models/AssetPool';
import { logger } from '../util/logger';
import { RewardConditionInteraction } from '@thxnetwork/common/lib/types';
import TwitterDataProxy from '../proxies/TwitterDataProxy';

export async function fetchTweetMetrics() {
    // Now, create the aggregation query
    try {
        const result = await PointReward.aggregate([
            {
                $lookup: {
                    from: AssetPool.collection.name,
                    let: { poolId: { $toObjectId: '$poolId' } },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$poolId'] } } }],
                    as: 'pool',
                },
            },
            {
                $unwind: '$pool',
            },
            {
                $match: {
                    interaction: {
                        $in: [
                            RewardConditionInteraction.TwitterLike,
                            RewardConditionInteraction.TwitterRetweet,
                            RewardConditionInteraction.TwitterLikeRetweet,
                        ],
                    },
                },
            },
            {
                $group: { _id: '$pool.sub', quests: { $push: '$$ROOT' } },
            },
        ]);

        for (const { _id, quests } of result) {
            const tweetIds = quests.map((q) => q.content);
            const metrics = await TwitterDataProxy.getTweetMetrics(_id, tweetIds);
            console.log(metrics);
            for (const quest of quests) {
                console.log(_id, quests.length);
            }
        }
    } catch (error) {
        console.log(error);
    }

    logger.info(`[${0}] Fetched ${0} Twitter Tweet Metrics`);
}
