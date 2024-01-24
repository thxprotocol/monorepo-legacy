import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { AccessTokenKind } from '@thxnetwork/types/enums';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req, res);
    const { tokenInfo, email } = await DiscordService.getTokens(code);

    // if there is a session we need to check for dups before we store the token
    if (interaction.session) {
        const isConnected = await AccountService.isConnected(interaction, tokenInfo.userId, AccessTokenKind.Discord);
        if (isConnected) {
            return res.render('error', {
                returnUrl: interaction.params.return_url,
                alert: { variant: 'danger', message: 'This account is already connected to another account.' },
            });
        }
    }
    const account = await AccountService.findOrCreate(interaction, tokenInfo, AccountVariant.SSODiscord, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
