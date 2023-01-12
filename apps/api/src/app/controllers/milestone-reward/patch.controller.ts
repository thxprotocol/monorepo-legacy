import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    param('id').isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { title, description, amount } = req.body;
    const { id } = req.params;

    const milestoneReward = await MilestoneRewardService.edit(id, {
        title,
        description,
        amount,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
