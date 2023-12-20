import { Request, Response } from 'express';
import { query } from 'express-validator';
import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const rewards = await MilestoneRewardService.findByPool(pool, page, limit);

    rewards.results = await Promise.all(
        rewards.results.map(async (reward) => {
            const claims = await MilestoneRewardClaimService.findByMilestoneReward(reward._id);
            return { claims, ...reward };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
