import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { TwitterService } from '../../../../services/TwitterService';
import { AccountDocument } from '../../../../models/Account';
import { ERROR_NO_ACCOUNT } from '../../../../util/messages';
import { getAccountByTwitterId, getInteraction, saveInteraction } from '../../../../util/oidc';

export async function controller(req: Request, res: Response) {
    async function getAccountBySub(sub: string) {
        const account = await AccountService.get(sub);
        if (!account) throw new Error(ERROR_NO_ACCOUNT);
        return account;
    }

    async function updateTokens(account: AccountDocument, tokens: any) {
        account.twitterAccessToken = tokens.access_token || account.twitterAccessToken;
        account.twitterRefreshToken = tokens.refresh_token || account.twitterRefreshToken;
        account.twitterAccessTokenExpires =
            Date.now() + Number(tokens.expires_in) * 1000 || account.twitterAccessTokenExpires;

        return await account.save();
    }

    const code = req.query.code as string;
    const uid = req.query.state as string;
    const error = req.query.error as string;

    if (error) return res.redirect(`/oidc/${uid}`);

    // Get all token information
    const tokens = await TwitterService.requestTokens(code);

    const user = await TwitterService.getUser(tokens.access_token);

    // Get the interaction based on the state
    const interaction = await getInteraction(uid);

    // Check if there is an active session for this interaction
    const account =
        interaction.session && interaction.session.accountId
            ? // If so, get account for sub
              await getAccountBySub(interaction.session.accountId)
            : // If not, get account for email claim
              await getAccountByTwitterId(user.id);

    // Actions after successfully login
    await AccountService.update(account, {
        lastLoginAt: Date.now(),
    });

    const returnTo = await saveInteraction(interaction, account._id.toString());

    await updateTokens(account, tokens);

    return res.redirect(returnTo);
}

export default { controller };
