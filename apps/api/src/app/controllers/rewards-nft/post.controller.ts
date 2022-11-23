import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createRewardNft, formatRewardNft } from '../rewards-utils';

const validation = [
    body('title').exists().isString(),
    body('slug').exists().isString(),
    body('expiryDate').optional().isString(),
    body('erc721metadataId').exists().isString(),
    body('rewardConditionId').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const { reward, claims } = await createRewardNft(req.assetPool, req.body);
    const rewardFormatted = await formatRewardNft(reward);
    res.status(201).json({ ...rewardFormatted, claims });
};

export default { controller, validation };
