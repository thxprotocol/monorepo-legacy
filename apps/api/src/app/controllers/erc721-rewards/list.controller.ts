import { Request, Response } from 'express';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';
import { query } from 'express-validator';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const rewards = await ERC721RewardService.findByPool(req.assetPool, page, limit);
    const promises = rewards.results.map(async (reward, i) => {
        const claims = await ClaimService.findByReward(reward);
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
