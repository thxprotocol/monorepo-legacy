import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('platform').isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('contentMetadata').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const { title, description, amount, platform, interaction, content } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const pointReward = await PointRewardService.create(pool, {
        title,
        description,
        amount,
        platform,
        interaction,
        content,
        contentMetadata: req.body.contentMetadata,
    });

    res.status(201).json(pointReward);
};

export default { validation, controller };
