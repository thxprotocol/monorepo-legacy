import { Request, Response } from 'express';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import { query } from 'express-validator';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const rewards = await ERC721PerkService.findByPool(req.assetPool, page, limit);
    rewards.results = await Promise.all(
        rewards.results.map(async (reward) => {
            const claims = await ClaimService.findByReward(reward);
            return {
                claims,
                ...reward,
            };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
