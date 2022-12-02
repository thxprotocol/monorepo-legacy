import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('expiryDate').optional().isString(),
    body('platform').isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const pointReward = await PointReward.create(req.body);
    res.json(pointReward);
};

export default { validation, controller };
