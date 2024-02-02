import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { OAuthVariant } from '@thxnetwork/common/lib/types';
import TokenService from '@thxnetwork/auth/services/TokenService';
import AuthService from '@thxnetwork/auth/services/AuthService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const token = await TokenService.requestToken({ variant: OAuthVariant.Twitter, code });
    const account = await AuthService.signin(interaction, token, AccountVariant.SSOTwitter);
    const returnUrl = await AuthService.getReturn(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
