import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import AuthService from '@thxnetwork/auth/services/AuthService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const tokens = await DiscordService.getTokens(code);
    const account = await AuthService.signin(interaction, tokens, AccountVariant.SSODiscord);
    const returnUrl = await AuthService.getReturnUrl(account, interaction);

    res.redirect(returnUrl);
}

export default { controller };
