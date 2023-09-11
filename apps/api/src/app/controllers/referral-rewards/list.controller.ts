import { Request, Response } from 'express';
import { query } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const quests = await RewardReferralService.findByPool(pool, page, limit);

    const promises = quests.results.map(async (quest, i) => {
        const entries = await ReferralRewardClaimService.findByReferralReward(quest);
        quests.results[i] = { entries, ...quest };
        return quests;
    });

    await Promise.all(promises);

    res.json(quests);
};

export default { controller, validation };
