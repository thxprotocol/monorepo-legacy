import { Request, Response } from 'express';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import AuthService from '@thxnetwork/auth/services/AuthService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const tokens = await YouTubeService.getTokens(code);
    const account = await AuthService.signin(interaction, tokens, AccountVariant.SSOGoogle);
    const returnUrl = await AuthService.getReturn(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
