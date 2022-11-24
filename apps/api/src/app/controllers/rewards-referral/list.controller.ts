import { Request, Response } from 'express';
import { query } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    const rewards = await RewardReferralService.findByPool(req.assetPool, page, limit);

    const promises = rewards.results.map(async (reward, i) => {
        const claims = await ClaimService.findByReward(reward);
        rewards.results[i] = { claims, ...reward.toJSON() };
        return rewards;
    });

    await Promise.all(promises);

    res.json(rewards);
};

export default { controller, validation };
