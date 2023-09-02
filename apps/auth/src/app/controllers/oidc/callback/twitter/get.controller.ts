import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { TwitterService } from '../../../../services/TwitterService';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccessTokenKind } from '@thxnetwork/types/enums';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req, res);
    const { tokenInfo, email } = await TwitterService.getTokens(code);

    // if there is a session we need to check for dups before we store the token
    if (interaction.session) {
        const isConnected = await AccountService.isConnected(interaction, tokenInfo.userId, AccessTokenKind.Twitter);
        if (isConnected) {
            return res.render('error', {
                returnUrl: interaction.params.return_url,
                alert: { variant: 'danger', message: 'This account is already connected to another account.' },
            });
        }
    }

    const account = await AccountService.findOrCreate(interaction, tokenInfo, AccountVariant.SSOTwitter, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
