import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createReward } from './utils';

const validation = [
    body('title').exists().isString(),
    body('slug').exists().isString(),
    body('expiryDate').optional().isString(),
    body('withdrawAmount').exists().isNumeric(),
    body('withdrawDuration').exists().isNumeric(),
    body('withdrawLimit').optional().isNumeric(),
    body('withdrawUnlockDate').isDate().optional({ nullable: true }),
    body('withdrawCondition.channelType').optional().isNumeric(),
    body('withdrawCondition.channelAction').optional().isNumeric(),
    body('withdrawCondition.channelItem').optional().isString(),
    body('amount').isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    const { reward, claims } = await createReward(req.assetPool, req.body);
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
