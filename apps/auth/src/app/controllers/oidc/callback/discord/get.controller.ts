import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccountVariant } from '../../../../types/enums/AccountVariant';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { AccessTokenKind } from '@thxnetwork/types/enums';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const { tokenInfo, email } = await DiscordService.getTokens(code);

    // if there is a session we need to check for dups before we store the token
    if (interaction.session) {
        await AccountService.isConnected(tokenInfo.userId, AccessTokenKind.Discord);
    }

    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSODiscord, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
