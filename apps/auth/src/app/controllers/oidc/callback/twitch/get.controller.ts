import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { ERROR_NO_ACCOUNT } from '@thxnetwork/auth/util/messages';
import { Request, Response } from 'express';
import { AccountDocument } from '../../../../models/Account';
import { AccountService } from '../../../../services/AccountService';
import { AccountVariant } from '../../../../types/enums/AccountVariant';
import { getAccountByEmail, getInteraction, saveInteraction } from '../../../../util/oidc';

async function updateTokens(account: AccountDocument, tokens: any): Promise<AccountDocument> {
    account.twitchAccessToken = tokens.access_token || account.twitchAccessToken;
    account.twitchRefreshToken = tokens.refresh_token || account.twitchRefreshToken;
    account.twitchAccessTokenExpires =
        Date.now() + Number(tokens.expires_in) * 1000 || account.twitchAccessTokenExpires;

    return await account.save();
}

async function getAccountBySub(sub: string): Promise<AccountDocument> {
    const account = await AccountService.get(sub);
    if (!account) throw new Error(ERROR_NO_ACCOUNT);
    return account;
}
async function controller(req: Request, res: Response) {
    const code = req.query.code as string;
    const uid = req.query.state as string;
    const error = req.query.error as string;
    if (error) return res.redirect(`/oidc/${uid}`);

    // Get all token information
    const tokens = await TwitchService.requestTokens(code);
    const user = await TwitchService.getUser(tokens.access_token);
    const email = user.data[0].email;

    // Get the interaction based on the state
    const interaction = await getInteraction(uid);

    // Check if there is an active session for this interaction
    const account =
        interaction.session && interaction.session.accountId
            ? // If so, get account for sub
              await getAccountBySub(interaction.session.accountId)
            : // If not, get account for email claim
              await getAccountByEmail(email, AccountVariant.SSOTwitch);

    // Actions after successfully login
    await AccountService.update(account, {
        lastLoginAt: Date.now(),
        email,
    });

    const returnTo = await saveInteraction(interaction, account._id.toString());

    await updateTokens(account, tokens);

    return res.redirect(returnTo);
}

export default { controller };
