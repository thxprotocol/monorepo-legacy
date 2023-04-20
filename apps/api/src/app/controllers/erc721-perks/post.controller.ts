import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { createERC721Perk, validateTokenGatingSchema } from '@thxnetwork/api/util/rewards';
import { TERC721Perk } from '@thxnetwork/types/interfaces/ERC721Perk';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';

const validation = [
    body('title').exists().isString(),
    body('description').exists().isString(),
    body('erc721metadataIds').optional().isString(),
    body('erc721tokenId').optional().isMongoId(),
    body('expiryDate').optional().isString(),
    body('claimAmount').optional().isInt({ lt: 1000 }),
    body('claimLimit').optional().isInt(),
    body('pointPrice').optional().isNumeric(),
    body('price').isInt(),
    body('priceCurrency').isString(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('isPromoted').optional().isBoolean(),
    check('tokenGating')
        .optional()
        .custom((value) => {
            return validateTokenGatingSchema(value);
        }),
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

    let perks: any;
    const metadataIdList = req.body.erc721metadataIds ? JSON.parse(req.body.erc721metadataIds) : [];
    if (metadataIdList.length > 0) {
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

        perks = await Promise.all(
            metadataIdList.map(async (erc721metadataId: string) => {
                const config = getPerkConfig({ pool, erc721, erc721metadataId, image, req });

                const { reward, claims } = await createERC721Perk(pool, config);
                return { ...reward.toJSON(), claims, erc721: erc721 };
            }),
        );
    } else {
        if (!req.body.erc721tokenId) {
            throw new BadRequestError('erc721tokenId or erc721metadataIds required');
        }
        const erc721Token = await ERC721Token.findById(req.body.erc721tokenId);
        if (!erc721Token) throw new NotFoundError('Could not find erc721Token');
        const erc721 = await ERC721Service.findById(erc721Token.erc721Id);
        const config = getPerkConfig({ pool, erc721, image, req });
        const reward = await ERC721PerkService.create(pool, config);

        perks = [{ ...reward.toJSON(), erc721: erc721 }];
    }
    res.status(201).json(perks);
};

function getPerkConfig(args: {
    pool: AssetPoolDocument;
    req: Request;
    erc721metadataId?: string;
    image: string;
    erc721: ERC721Document;
}) {
    return {
        poolId: String(args.pool._id),
        erc721Id: String(args.erc721._id),
        erc721metadataId: args.erc721metadataId,
        image: args.image,
        title: args.req.body.title,
        description: args.req.body.description,
        platform: args.req.body.platform,
        interaction: args.req.body.interaction,
        content: args.req.body.content,
        claimAmount: args.req.body.claimAmount,
        claimLimit: args.req.body.claimLimit,
        limit: args.req.body.limit,
        expiryDate: args.req.body.expiryDate,
        pointPrice: args.req.body.pointPrice,
        isPromoted: args.req.body.isPromoted,
        price: args.req.body.price,
        priceCurrency: args.req.body.priceCurrency,
        erc721tokenId: args.req.body.erc721tokenId,
        tokenGating: args.req.body.tokenGating,
    } as TERC721Perk;
}

export default { controller, validation };
