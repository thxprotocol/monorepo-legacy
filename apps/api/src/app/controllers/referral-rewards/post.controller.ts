import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createReferralReward } from '../rewards-utils';

const validation = [
    body('title').exists().isString(),
    body('slug').exists().isString(),
    body('expiryDate').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    const { reward, claims } = await createReferralReward(req.assetPool, req.body);
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
