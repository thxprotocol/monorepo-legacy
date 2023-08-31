import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { AccessTokenKind } from '@thxnetwork/types/enums';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req, res);
    const { tokenInfo, email } = await TwitchService.getTokens(code);

    // if there is a session we need to check for dups before we store the token
    if (interaction.session) {
        await AccountService.isConnected(res, interaction, tokenInfo.userId, AccessTokenKind.Twitch);
    }

    const account = await AccountService.findOrCreate(interaction, tokenInfo, AccountVariant.SSOTwitch, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    return res.redirect(returnUrl);
}

export default { controller };
