import { Request, Response } from 'express';
import { ShopifyDiscountCode } from '@thxnetwork/api/models/ShopifyDiscountCode';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsShopify']
    const discountCodes = await ShopifyDiscountCode.find({ sub: req.auth.sub, poolId: req.header('X-PoolId') });
    res.json(discountCodes);
};

export default { controller, validation };
