import { AssetPool } from '../models/AssetPool';
import { Participant } from '../models/Participant';
import { logger } from '../util/logger';
import AnalyticsService from '../services/AnalyticsService';

export async function updateParticipantRanks() {
    try {
        const campaigns = await AssetPool.find({
            'settings.isPublished': true,
        });

        for (const campaign of campaigns) {
            try {
                const leaderboard = await AnalyticsService.getLeaderboard(campaign);
                const updates = leaderboard.map(({ sub }: { sub: string }, index: number) => ({
                    updateOne: {
                        filter: { poolId: String(campaign._id), sub },
                        update: { $set: { rank: Number(index) + 1 } },
                    },
                }));

                await Participant.bulkWrite(updates);
            } catch (error) {
                logger.error(error);
            }
        }
    } catch (error) {
        logger.error(error);
    }
}
