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
        const leaderboard = await AnalyticsService.createLeaderboard(campaign);
        const updates = leaderboard.map(
            (entry: { sub: string; score: number; questEntryCount: number }, index: number) => ({
                updateOne: {
                    filter: { poolId: String(campaign._id), sub: entry.sub },
                    update: {
                        $set: {
                            rank: Number(index) + 1,
                            score: entry.score,
                            questEntryCount: entry.questEntryCount,
                        },
                    },
                },
            }),
        );

        await Participant.bulkWrite(updates);
    } catch (error) {
        logger.error(error);
    }
}
