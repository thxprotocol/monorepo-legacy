import { Request, Response } from 'express';
import { param } from 'express-validator';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';

export const validation = [param('sub').isString()];

export const getShopifyPriceRules = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await ShopifyService.isAuthorized(account);
    if (!isAuthorized) return new UnauthorizedError();
    const priceRules = await ShopifyService.getDiscountPriceRules(
        account.getToken(AccessTokenKind.Shopify).accessToken,
        account.shopifyStoreUrl,
    );
    return res.json(priceRules);
};
