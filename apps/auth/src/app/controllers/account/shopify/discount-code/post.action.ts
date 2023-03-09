import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';
import { BadRequestError, UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';

export const createShopifyDiscountCode = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await ShopifyService.isAuthorized(account);
    if (!isAuthorized) return new UnauthorizedError();

    if (!req.body.priceRuleId || !req.body.discountCode) {
        throw new BadRequestError();
    }
    const discountCode = await ShopifyService.createDiscountCode(
        account.getToken(AccessTokenKind.Shopify).accessToken,
        account.shopifyStoreUrl,
        req.body.priceRuleId,
        req.body.discountCode,
    );
    return res.status(201).json(discountCode);
};
