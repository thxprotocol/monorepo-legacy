import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { sendPoolNotification } from '@thxnetwork/api/jobs/sendPoolNotifications';

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
    const { title, description, amount, platform, interaction, content, contentMetadata } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await PointRewardService.create(pool, {
        title,
        description,
        amount,
        platform,
        interaction,
        content,
        contentMetadata,
    });
    await sendPoolNotification(pool._id, reward);
    res.status(201).json(reward);
};

export default { validation, controller };
