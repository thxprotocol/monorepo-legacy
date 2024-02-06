import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import TokenService from '@thxnetwork/auth/services/TokenService';
import AuthService from '@thxnetwork/auth/services/AuthService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const token = await TokenService.request({ kind: AccessTokenKind.Twitter, code });
    const account = await AuthService.upsertAccount(interaction, token, AccountVariant.SSOTwitter);
    const returnUrl = await AuthService.getReturn(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
