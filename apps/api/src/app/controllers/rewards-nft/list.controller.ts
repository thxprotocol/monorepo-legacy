import { Request, Response } from 'express';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardNftService from '@thxnetwork/api/services/RewardNftService';
import { formatRewardNft } from '../rewards-utils';
import { query } from 'express-validator';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const rewards = await RewardNftService.findByPool(req.assetPool, page, limit);

    const promises = rewards.results.map(async (r, i) => {
        const claims = await ClaimService.findByReward(r);
        const reward = await formatRewardNft(r);
        rewards.results[i] = {
            claims,
            ...reward,
        };

        return rewards;
    });

    await Promise.all(promises);

    res.json(rewards);
};

export default { controller, validation };
