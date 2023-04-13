import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('limit').isInt(),
    param('id').isMongoId(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const { title, description, amount, limit } = req.body;
    const milestoneReward = await MilestoneRewardService.edit(req.params.id, {
        title,
        description,
        amount,
        limit,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
