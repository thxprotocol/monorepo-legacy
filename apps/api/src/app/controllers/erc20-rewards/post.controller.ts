import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createERC20Reward } from '@thxnetwork/api/util/rewards';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').exists().isInt({ gt: 0 }),
    body('expiryDate').optional().isString(),
    body('claimAmount').optional().isInt({ gt: 0 }),
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { reward, claims } = await createERC20Reward(req.assetPool, req.body);
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
