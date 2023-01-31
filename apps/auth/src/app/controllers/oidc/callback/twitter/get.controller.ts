import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { TwitterService } from '../../../../services/TwitterService';
import { callbackPostAuth, callbackPreAuth } from '../../get';
import { AccountVariant } from '@thxnetwork/auth/types/enums/AccountVariant';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const { tokenInfo, email } = await TwitterService.getTokens(code);
    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSOGithub, email);
    const returnUrl = await callbackPostAuth(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
