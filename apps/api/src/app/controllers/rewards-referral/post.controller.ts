import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createRewardReferral, formatRewardReferral } from '../rewards-utils';

const validation = [
    body('title').exists().isString(),
    body('slug').exists().isString(),
    body('expiryDate').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    const { reward, claims } = await createRewardReferral(req.assetPool, req.body);
    const formattedReward = await formatRewardReferral(reward);
    res.status(201).json({ ...formattedReward, claims });
};

export default { controller, validation };
