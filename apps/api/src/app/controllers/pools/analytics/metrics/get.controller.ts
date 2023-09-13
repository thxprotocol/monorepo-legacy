import { Request, Response } from 'express';
import { param } from 'express-validator';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool.address) return res.json(pool.toJSON());

    const metrics = await AnalyticsService.getPoolMetrics(pool);

    res.json({ _id: pool._id, ...metrics });
};

export default { controller, validation };
