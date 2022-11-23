import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createRewardToken, formatRewardToken } from '../rewards-utils';

const validation = [
    body('title').exists().isString(),
    body('slug').exists().isString(),
    body('expiryDate').optional().isString(),
    body('rewardConditionId').optional().isString(),
    body('withdrawAmount').exists().isInt({ gt: 0 }),
    body('amount').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { reward, claims } = await createRewardToken(req.assetPool, req.body);
    const rewardFormatted = await formatRewardToken(reward);
    res.status(201).json({ ...rewardFormatted, claims });
};

export default { controller, validation };
