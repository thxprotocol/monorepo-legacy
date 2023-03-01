import { Account } from '@thxnetwork/auth/models/Account';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);

    const account = await Account.findById(String(interaction.session.accountId));
    if (!account) throw new UnauthorizedError('Invald account');

    if (!req.query.shop) throw new UnauthorizedError('Could not find shop in query');
    const shop = String(req.query.shop);
    const tokens = await ShopifyService.getTokens(shop, String(code));
    account.setToken(tokens.tokenInfo);
    account.shopifyStoreUrl = 'https://' + shop;
    await account.save();

    const returnUrl = await callbackPostSSOCallback(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
