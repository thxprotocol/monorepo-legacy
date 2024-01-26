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
        const kinds = [AccessTokenKind.YoutubeManage, AccessTokenKind.YoutubeView, AccessTokenKind.Google];
        const results = await Promise.all(
            kinds.map(async (kind: AccessTokenKind) => ({
                kind,
                result: await YouTubeService.hasYoutubeScopes(tokenInfo.accessToken, kind),
            })),
        );
        const { kind } = results.find((r) => !!r.result);
        const isConnected = await AccountService.isConnected(interaction, tokenInfo.userId, kind);
        if (isConnected) {
            return res.render('error', {
                returnUrl: interaction.params.return_url,
                alert: { variant: 'danger', message: 'This account is already connected to another account.' },
            });
        }
    }

    const account = await AccountService.findOrCreate(interaction, tokenInfo, AccountVariant.SSOGoogle, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
