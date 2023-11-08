import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool.address) return res.json(pool.toJSON());

    const leaderBoard = await AnalyticsService.getLeaderboard(pool);
    res.json(leaderBoard.slice(0, 10));
};

export default { controller, validation };
