import { logger } from '../util/logger';
import { PointReward } from '../models/PointReward';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import PointRewardService from '../services/PointRewardService';

export async function fetchTweetMetrics() {
    try {
        const result = await PointRewardService.aggregateTwitterQuestsBySub();

        // _id is the sub here
        for (const { _id, quests } of result) {
            try {
                const tweetIds = quests.map((q) => q.content);
                const metrics: { id: string; public_metrics: any }[] = await TwitterDataProxy.getTweetMetrics(
                    _id,
                    tweetIds,
                );

                // Pick metrics from the fetched data
                for (const quest of quests) {
                    try {
                        const metric = metrics.find(({ id }) => quest.content === id);
                        if (!metric) continue;

                        // Enriched existing contentMetadata with tweet metrics
                        const contentMetadata = quest.contentMetadata ? JSON.parse(quest.contentMetadata) : {};
                        await PointReward.findByIdAndUpdate(quest._id, {
                            contentMetadata: JSON.stringify({ ...contentMetadata, metrics: metric.public_metrics }),
                        });
                    } catch (error) {
                        logger.error(error);
                    }
                }

                logger.info(`[${_id}] Updated ${quests.length} quests with Twitter Tweet Metrics`);
            } catch (error) {
                logger.error(error);
            }
        }
    } catch (error) {
        logger.error(error);
    }
}
