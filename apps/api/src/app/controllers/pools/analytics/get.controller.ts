import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';

export const validation = [param('id').isMongoId(), query('startDate').exists(), query('endDate').exists()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!pool.address) return res.json(pool.toJSON());

    // CHART QUERY
    const startDate = new Date(String(req.query.startDate));
    const endDate = new Date(String(req.query.endDate));
    const result = await AnalyticsService.getPoolAnalyticsForChart(pool, startDate, endDate);

    res.json(result);
};

export default { controller, validation };
