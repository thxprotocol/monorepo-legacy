import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import AuthService from '@thxnetwork/auth/services/AuthService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const tokens = await TwitchService.getTokens(code);
    const account = await AuthService.signin(interaction, tokens, AccountVariant.SSOTwitch);
    const returnUrl = await AuthService.getReturn(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
