import { Request, Response } from 'express';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import { PaginationResult } from '@thxnetwork/api/util/pagination';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const pointRewards: PaginationResult = await PointRewardService.findByPool(
        pool,
        Number(req.query.page),
        Number(req.query.limit),
    );

    res.json(pointRewards);
};

export default { controller };
