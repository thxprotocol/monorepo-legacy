import { AssetPool } from '../models/AssetPool';
import { Participant } from '../models/Participant';
import { logger } from '../util/logger';
import AnalyticsService from '../services/AnalyticsService';
import { Job } from '@hokify/agenda';

export async function updateParticipantRanks(job: Job) {
    if (!job.attrs.data) return;

    try {
        const { poolId } = job.attrs.data as { poolId: string };
        const campaign = await AssetPool.findById(poolId);
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
