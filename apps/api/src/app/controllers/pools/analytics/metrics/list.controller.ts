import { Request, Response } from 'express';
import { param } from 'express-validator';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Participant } from '@thxnetwork/api/models/Participant';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const metrics = await AnalyticsService.getPoolMetrics(pool);
    const participantCount = await Participant.countDocuments({ poolId: pool._id });
    const participantActiveCount = await Participant.countDocuments({ poolId: pool._id, score: { $gt: 0 } });
    const subscriptionCount = await Participant.countDocuments({ poolId: pool._id, isSubscribed: true });

    res.json({ _id: pool._id, participantCount, participantActiveCount, subscriptionCount, ...metrics });
};

export default { controller, validation };
