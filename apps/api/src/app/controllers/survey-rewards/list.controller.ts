import { Request, Response } from 'express';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import { PaginationResult } from '@thxnetwork/api/util/pagination';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SurveyRewardDocument } from '@thxnetwork/api/models/SurveyReward';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const rewards: PaginationResult = await SurveyRewardService.findByPool(
        pool,
        Number(req.query.page),
        Number(req.query.limit),
    );

    for (let i = 0; i < rewards.results.length; i++) {
        const r = (await rewards.results[i]) as SurveyRewardDocument;
        const reward = { ...r.toJSON(), questions: await r.questions };
        rewards.results[i] = reward;
    }
    res.json(rewards);
};

export default { controller };
