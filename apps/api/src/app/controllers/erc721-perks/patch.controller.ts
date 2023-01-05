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
    // #swagger.tags = ['RewardsNft']
    let reward = await ERC721PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    reward = await ERC721PerkService.update(reward, {
        poolId: req.header('X-PoolId'),
        erc721metadataId: JSON.parse(req.body.erc721metadataIds)[0],
        image,
        title: req.body.title,
        description: req.body.description,
        expiryDate: req.body.expiryDate,
        claimAmount: req.body.claimAmount,
        pointPrice: req.body.pointPrice,
        isPromoted: req.body.isPromoted,
    } as TERC721Perk);
    return res.json(reward);
};

export default { controller, validation };
