import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';

export const getShopify = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await ShopifyService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });
    return res.json({ isAuthorized });
};
