import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createERC721Reward } from '@thxnetwork/api/util/rewards';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('erc721metadataId').exists().isString(),
    body('expiryDate').optional().isString(),
    body('claimAmount').optional().isInt({ gt: 0 }),
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const { reward, claims } = await createERC721Reward(req.assetPool, req.body);
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
