import { Request, Response } from 'express';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { NotFoundError } from '@thxnetwork/auth//util/errors';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';

export const getShopifyTotalSpent = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Shopify);
    if (!token) throw new NotFoundError();

    const result = await ShopifyService.validateTotalSpent(
        token.accessToken,
        account.shopifyStoreUrl,
        String(req.query.email),
        Number(req.query.amount),
    );

    res.json({ result });
};
