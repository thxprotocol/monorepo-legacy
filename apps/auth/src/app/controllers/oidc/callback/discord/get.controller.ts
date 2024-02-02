import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { OAuthVariant } from '@thxnetwork/common/lib/types';
import AuthService from '@thxnetwork/auth/services/AuthService';
import TokenService from '@thxnetwork/auth/services/TokenService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const token = await TokenService.requestToken({ variant: OAuthVariant.Discord, code });
    const account = await AuthService.signin(interaction, token, AccountVariant.SSODiscord);
    const returnUrl = await AuthService.getReturnUrl(account, interaction);

    res.redirect(returnUrl);
}

export default { controller };
