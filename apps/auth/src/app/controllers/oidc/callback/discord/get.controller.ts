import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccountVariant } from '../../../../types/enums/AccountVariant';
import { callbackPostAuth, callbackPreAuth } from '../../get';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const { tokenInfo, email } = await DiscordService.getTokens(code);
    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSODiscord, email);
    const returnUrl = await callbackPostAuth(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
