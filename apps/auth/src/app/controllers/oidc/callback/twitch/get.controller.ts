import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import AuthService from '@thxnetwork/auth/services/AuthService';
import TokenService from '@thxnetwork/auth/services/TokenService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const token = await TokenService.request({ kind: AccessTokenKind.Twitch, code });
    const account = await AuthService.upsertAccount(interaction, token, AccountVariant.SSOTwitch);
    const returnUrl = await AuthService.getReturn(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
