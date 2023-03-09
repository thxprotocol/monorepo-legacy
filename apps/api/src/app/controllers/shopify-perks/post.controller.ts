import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import ShopifyPerkService from '@thxnetwork/api/services/ShopifyPerkService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    body('title').exists().isString(),
    body('description').exists().isString(),
    body('claimAmount').exists().isInt({ lt: 1000 }),
    body('claimLimit').optional().isInt(),
    body('expiryDate').optional().isString(),
    body('platform').exists().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('pointPrice').optional().isNumeric(),
    body('image').optional().isString(),
    body('isPromoted').optional().isBoolean(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('image').optional().isString(),
    body('priceRuleId').exists().isString(),
    body('discountCode').exists().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsShopify']
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const reward = await ShopifyPerkService.create(pool, { ...req.body, image });
    const claims = await Promise.all(
        Array.from({ length: Number(req.body.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: pool._id,
                rewardUuid: reward.uuid,
            }),
        ),
    );
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
