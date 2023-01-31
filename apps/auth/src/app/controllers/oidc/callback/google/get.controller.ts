import { Request, Response } from 'express';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { AccountVariant } from '@thxnetwork/auth/types/enums/AccountVariant';
import { callbackPostAuth, callbackPreAuth } from '../../get';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const { tokenInfo, email } = await YouTubeService.getTokens(code);
    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSOGoogle, email);
    const returnUrl = await callbackPostAuth(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
