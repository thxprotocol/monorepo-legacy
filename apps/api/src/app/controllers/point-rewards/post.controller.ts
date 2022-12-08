import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import db from '@thxnetwork/api/util/database';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('platform').isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const { title, description, amount, platform, interaction, content } = req.body;
    const pointReward = await PointReward.create({
        uuid: db.createUUID(),
        poolId: req.assetPool._id,
        title,
        description,
        amount,
        platform,
        interaction,
        content,
    });
    res.status(201).json(pointReward);
};

export default { validation, controller };
