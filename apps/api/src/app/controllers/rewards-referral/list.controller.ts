import { Request, Response } from 'express';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardReferralService from '@thxnetwork/api/services/RewardReferralService';
import { query } from 'express-validator';
import { formatRewardReferral } from '../rewards-utils';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    const rewards = await RewardReferralService.findByPool(req.assetPool, page, limit);

    const promises = rewards.results.map(async (r, i) => {
        const rewardBaseId = r.rewardBaseId;

        const claims = await ClaimService.findByReward(r);
        const reward = await formatRewardReferral(r);
        rewards.results[i] = {
            claims,
            id: rewardBaseId,
            ...reward,
        };

        return rewards;
    });

    await Promise.all(promises);

    res.json(rewards);
};

export default { controller, validation };
