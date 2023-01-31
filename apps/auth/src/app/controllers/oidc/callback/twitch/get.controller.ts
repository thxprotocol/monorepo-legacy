import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { callbackPostAuth, callbackPreAuth } from '../../get';
import { AccountVariant } from '@thxnetwork/auth/types/enums/AccountVariant';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const { tokenInfo, email } = await TwitchService.getTokens(code);
    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSOTwitch, email);
    const returnUrl = await callbackPostAuth(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
