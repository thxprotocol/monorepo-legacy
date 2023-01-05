import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { createERC721Perk } from '@thxnetwork/api/util/rewards';
import ImageService from '@thxnetwork/api/services/ImageService';
import { TERC721Perk } from '@thxnetwork/types/interfaces/ERC721Perk';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [
    body('title').exists().isString(),
    body('description').exists().isString(),
    body('erc721Id').exists().isMongoId(),
    body('erc721metadataIds').exists().isString(),
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
    body('isPromoted').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']
    let image: string;

    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc721 = await ERC721Service.findById(req.body.erc721Id);

    // Check if erc721 already is mintable by pool
    const isMinter = await ERC721Service.isMinter(erc721, pool.address);
    if (!isMinter) {
        await ERC721Service.addMinter(erc721, pool.address);
    }

    const perks = await Promise.all(
        JSON.parse(req.body.erc721metadataIds).map(async (erc721metadataId: string) => {
            const config = {
                poolId: String(pool._id),
                erc721metadataId,
                image,
                title: req.body.title,
                erc721Id: req.body.erc721Id,
                description: req.body.description,
                expiryDate: req.body.expiryDate,
                claimAmount: req.body.claimAmount,
                pointPrice: req.body.pointPrice,
                isPromoted: req.body.isPromoted,
            } as TERC721Perk;
            const { reward, claims } = await createERC721Perk(pool, config);

            return { ...reward.toJSON(), claims };
        }),
    );

    res.status(201).json(perks);
};

export default { controller, validation };
