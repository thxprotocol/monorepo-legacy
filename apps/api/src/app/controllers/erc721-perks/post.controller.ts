import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { createERC721Perk } from '@thxnetwork/api/util/rewards';
import { TERC721Perk } from '@thxnetwork/types/interfaces/ERC721Perk';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import MerchantService from '@thxnetwork/api/services/MerchantService';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';

const validation = [
    body('title').exists().isString(),
    body('description').exists().isString(),
    body('erc721metadataIds').exists().isString(),
    body('expiryDate').optional().isString(),
    body('claimAmount').optional().isInt({ lt: 1000 }),
    body('claimLimit').optional().isInt(),
    body('platform').exists().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('pointPrice').optional().isNumeric(),
    body('price').isInt(),
    body('priceCurrency').isString(),
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

    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool');

    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }

    const metadataIdList = JSON.parse(req.body.erc721metadataIds);

    // Get one metadata so we can obtain erc721Id from it
    const metadata = await ERC721Service.findMetadataById(metadataIdList[0]);
    if (!metadata) throw new NotFoundError('Could not find first metadata from list');

    const erc721 = await ERC721Service.findById(metadata.erc721Id);
    if (!erc721) throw new NotFoundError('Could not find erc721');

    // Check if erc721 already is mintable by pool
    const isMinter = await ERC721Service.isMinter(erc721, pool.address);
    if (!isMinter) {
        await ERC721Service.addMinter(erc721, pool.address);
    }

    const perks = await Promise.all(
        metadataIdList.map(async (erc721metadataId: string) => {
            const config = {
                poolId: String(pool._id),
                erc721Id: erc721._id,
                erc721metadataId,
                image,
                title: req.body.title,
                description: req.body.description,
                platform: req.body.platform,
                interaction: req.body.interaction,
                content: req.body.content,
                claimAmount: req.body.claimAmount,
                claimLimit: req.body.claimLimit,
                rewardLimit: req.body.rewardLimit,
                expiryDate: req.body.expiryDate,
                pointPrice: req.body.pointPrice,
                isPromoted: req.body.isPromoted,
                price: req.body.price,
                priceCurrency: req.body.priceCurrency,
            } as TERC721Perk;
            const { reward, claims } = await createERC721Perk(pool, config);

            return { ...reward.toJSON(), claims, erc721 };
        }),
    );

    res.status(201).json(perks);
};

export default { controller, validation };
