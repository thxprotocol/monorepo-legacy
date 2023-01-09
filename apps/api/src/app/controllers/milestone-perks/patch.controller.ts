import MilestonePerkService from '@thxnetwork/api/services/MilestonePerkService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    param('token').isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { title, description, amount } = req.body;
    const { token } = req.params;

    const milestoneReward = await MilestonePerkService.edit(token, {
        title,
        description,
        amount,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
