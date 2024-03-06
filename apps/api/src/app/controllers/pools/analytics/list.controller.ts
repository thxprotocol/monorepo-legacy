import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';

export const validation = [param('id').isMongoId(), query('startDate').exists(), query('endDate').exists()];

export const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const startDate = new Date(String(req.query.startDate));
    const endDate = new Date(String(req.query.endDate));
    const result = await AnalyticsService.getPoolAnalyticsForChart(pool, startDate, endDate);

    res.json(result);
};

export default { controller, validation };
