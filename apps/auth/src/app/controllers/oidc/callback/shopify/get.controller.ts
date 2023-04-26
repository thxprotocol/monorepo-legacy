import { Account } from '@thxnetwork/auth/models/Account';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { callbackPreAuth } from '../../get';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const accountId = interaction.session ? interaction.session.accountId : interaction.result.login.accountId;
    const account = await Account.findById(String(accountId));

    if (!account) throw new UnauthorizedError('Invald account');
    if (!req.query.shop) throw new UnauthorizedError('Could not find shop in query');

    const shopifyStoreUrl = 'https://' + String(req.query.shop);
    const tokens = await ShopifyService.getTokens(shopifyStoreUrl, String(code));

    account.setToken(tokens.tokenInfo);
    account.shopifyStoreUrl = shopifyStoreUrl;
    await account.save();

    res.redirect(interaction.params.return_url as string);
}

export default { controller };
