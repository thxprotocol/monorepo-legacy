import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import AuthService from '@thxnetwork/auth/services/AuthService';
import TokenService from '@thxnetwork/auth/services/TokenService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const token = await TokenService.request({ kind: AccessTokenKind.Discord, code });
    const account = await AuthService.upsertAccount(interaction, token, AccountVariant.SSODiscord);
    const returnUrl = await AuthService.getReturnUrl(account, interaction);

    res.redirect(returnUrl);
}

export default { controller };
