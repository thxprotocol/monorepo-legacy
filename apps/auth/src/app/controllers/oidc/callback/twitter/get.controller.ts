import { Request, Response } from 'express';
import { TwitterService } from '../../../../services/TwitterService';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import AuthService from '@thxnetwork/auth/services/AuthService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const tokens = await TwitterService.getTokens(code);
    const account = await AuthService.signin(interaction, tokens, AccountVariant.SSOTwitter);
    const returnUrl = await AuthService.getReturn(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
