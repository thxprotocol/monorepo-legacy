import { Request, Response } from 'express';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import { PaginationResult } from '@thxnetwork/api/util/pagination';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const rewards: PaginationResult = await SurveyRewardService.findByPool(
        pool,
        Number(req.query.page),
        Number(req.query.limit),
    );
    console.log('LIST RESULT', rewards);
    res.json(rewards);
};

export default { controller };
