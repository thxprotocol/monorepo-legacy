import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { createERC721Perk } from '@thxnetwork/api/util/rewards';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('erc721metadataId').exists().isString(),
    body('expiryDate').optional().isString(),
    body('claimAmount').optional().isInt({ gt: 0 }),
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('pointPrice').optional().isNumeric(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    const { reward, claims } = await createERC721Perk(req.assetPool, { ...req.body, image });
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
