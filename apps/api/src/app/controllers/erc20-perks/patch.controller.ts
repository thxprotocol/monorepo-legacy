import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import ERC20PerkService from '@thxnetwork/api/services/ERC20PerkService';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    param('id').isMongoId(),
    body('title').isString(),
    body('description').isString(),
    body('claimAmount').exists().isInt({ lt: 1000 }),
    body('expiryDate').optional().isString(),
    body('limit').isNumeric(),
    body('erc20Id').isMongoId(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('isPromoted').optional().isBoolean(),
    body('tokenGating.contractAddress').optional().isString(),
    body('tokenGating.variant').optional().isString(),
    body('tokenGating.amount').optional().isInt(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    let reward = await ERC20PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    const tokenGating = req.body.tokenGating ? JSON.parse(String(req.body.tokenGating)) : undefined;
    reward = await ERC20PerkService.update(reward, { ...req.body, image, tokenGating });
    return res.json(reward.toJSON());
};

export default { controller, validation };
