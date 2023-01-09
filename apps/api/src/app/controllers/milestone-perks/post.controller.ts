import db from '@thxnetwork/api/util/database';
import MilestonePerkService from '@thxnetwork/api/services/MilestonePerkService';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [body('title').isString(), body('description').isString(), body('amount').isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { title, description, amount } = req.body;

    const milestoneReward = await MilestonePerkService.create(req.assetPool, {
        title,
        description,
        amount,
    });

    res.status(201).json(milestoneReward);
};

export default { controller, validation };
