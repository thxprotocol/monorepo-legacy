import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('isEnabledWebhookQualification').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    const { title, description, amount, isEnabledWebhookQualification } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const pointReward = await DailyRewardService.create(pool, {
        title,
        description,
        amount,
        isEnabledWebhookQualification,
    });

    res.status(201).json(pointReward);
};

export default { validation, controller };
