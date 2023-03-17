import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import ShopifyPerkService from '@thxnetwork/api/services/ShopifyPerkService';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    param('id').isMongoId(),
    body('title').isString(),
    body('description').isString(),
    body('claimAmount').exists().isInt({ lt: 1000 }),
    body('expiryDate').optional().isString(),
    body('rewardLimit').isNumeric(),
    body('platform').exists().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('isPromoted').optional().isBoolean(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('priceRuleId').optional().isString(),
    body('discountCode').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    let reward = await ShopifyPerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    reward = await ShopifyPerkService.update(reward, { ...req.body, image });
    return res.json(reward.toJSON());
};

export default { controller, validation };
