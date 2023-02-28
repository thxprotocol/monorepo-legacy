import { DASHBOARD_URL } from '@thxnetwork/auth/config/secrets';
import { Account } from '@thxnetwork/auth/models/Account';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { callbackPreAuth } from '../../get';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);

    if (!code) throw new UnauthorizedError('Could not find code in query');

    const tokens = await ShopifyService.getTokens(String(req.query.shop), String(code));
    if (!interaction.session || interaction.session.accountId) {
        throw new UnauthorizedError();
    }
    const account = await Account.findById(interaction.session.accountId);
    account.setToken(tokens.tokenInfo);

    await account.save();
    return res.redirect(DASHBOARD_URL);
}

export default { controller };
