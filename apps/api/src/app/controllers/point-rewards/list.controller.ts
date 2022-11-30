import { Request, Response } from 'express';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import { PaginationResult } from '@thxnetwork/api/util/pagination';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Rewards']
    const pointRewards: PaginationResult = await PointRewardService.findByPool(
        req.assetPool,
        Number(req.query.page),
        Number(req.query.limit),
    );

    res.json(pointRewards);
};

export default { controller };
