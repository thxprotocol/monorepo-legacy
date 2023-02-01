import { Request, Response } from 'express';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { PaginationResult } from '@thxnetwork/api/util/pagination';
import PoolService from '@thxnetwork/api/services/PoolService';
import { query } from 'express-validator';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const dailyRewards: PaginationResult = await DailyRewardService.findByPool(
        pool,
        Number(req.query.page),
        Number(req.query.limit),
    );

    res.json(dailyRewards);
};

export default { controller, validation };
