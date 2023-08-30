import { Request, Response } from 'express';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';
import { AccessTokenKind } from '@thxnetwork/types/enums';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req, res);
    const { tokenInfo, email } = await YouTubeService.getTokens(code);

    // if there is a session we need to check for dups before we store the token
    if (interaction.session) {
        await AccountService.isConnected(interaction.session.accountId, tokenInfo.userId, AccessTokenKind.Google);
    }

    const account = await AccountService.findOrCreate(interaction, tokenInfo, AccountVariant.SSOGoogle, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
