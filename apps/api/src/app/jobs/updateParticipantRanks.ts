import { Pool } from '@thxnetwork/api/models';
import { logger } from '../util/logger';
import { Job } from '@hokify/agenda';
import AnalyticsService from '../services/AnalyticsService';

export async function updateParticipantRanks(job: Job) {
    if (!job.attrs.data) return;

    try {
        const { poolId } = job.attrs.data as { poolId: string };
        const campaign = await Pool.findById(poolId);
        if (!campaign) throw new Error('Could not find campaign');

        await AnalyticsService.createLeaderboard(campaign);

        logger.info('Updated participant ranks.');
    } catch (error) {
        logger.error(error);
    }
}
