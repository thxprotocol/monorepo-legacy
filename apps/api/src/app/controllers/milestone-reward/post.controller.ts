import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('limit').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { title, description, amount, limit } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const milestoneReward = await MilestoneRewardService.create(pool, {
        title,
        description,
        amount,
        limit,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
