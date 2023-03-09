import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';
import { AccessTokenKind } from '@thxnetwork/types/index';

export const getShopify = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await ShopifyService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    const { accessToken } = account.getToken(AccessTokenKind.Shopify);
    const enabledCurrencies = await ShopifyService.getEnabledCurrencies(accessToken, account.shopifyStoreUrl);

    return res.json({ isAuthorized, enabledCurrencies });
};
