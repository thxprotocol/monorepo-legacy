import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { NotFoundError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';

export const getShopifyOrderAmount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token = account.getToken(AccessTokenKind.Shopify);
    if (!token) throw new NotFoundError();

    const result = await ShopifyService.validateOrderAmount(
        token.accessToken,
        account.shopifyStoreUrl,
        String(req.query.email),
        Number(req.query.amount),
    );

    res.json({ result });
};
