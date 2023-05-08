import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import ImageService from '@thxnetwork/api/services/ImageService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { TERC721Perk } from '@thxnetwork/types/index';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').isString(),
    body('description').isString(),
    body('erc721metadataIds').exists().isString(),
    body('claimAmount').exists().isInt({ lt: 1000 }),
    body('claimLimit').exists().isInt(),
    body('expiryDate').optional().isString(),
    body('limit').optional().isInt(),
    body('pointPrice').optional().isNumeric(),
    body('price').isInt(),
    body('priceCurrency').isString(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('isPromoted').optional().isBoolean(),
    body('tokenGatingContractAddress').optional().isString(),
    body('tokenGatingVariant').optional().isString(),
    body('tokenGatingAmount').optional().isInt(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let perk = await ERC721PerkService.get(req.params.id);
    if (!perk) throw new NotFoundError('Could not find the perk');

    let image: string;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }

    perk = await ERC721PerkService.update(perk, {
        poolId: req.header('X-PoolId'),
        erc721metadataId: JSON.parse(req.body.erc721metadataIds)[0],
        image,
        title: req.body.title,
        description: req.body.description,
        erc721Id: req.body.erc721Id,
        expiryDate: req.body.expiryDate,
        claimAmount: req.body.claimAmount,
        claimLimit: req.body.claimLimit,
        pointPrice: req.body.pointPrice,
        price: req.body.price,
        priceCurrency: req.body.priceCurrency,
        isPromoted: req.body.isPromoted,
        limit: req.body.limit,
        tokenGatingVariant: req.body.tokenGatingVariant,
        tokenGatingContractAddress: req.body.tokenGatingContractAddress,
        tokenGatingAmount: req.body.tokenGatingAmount,
    } as TERC721Perk);

    return res.json(perk);
};

export default { controller, validation };
