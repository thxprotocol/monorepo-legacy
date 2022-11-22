import { Request, Response } from 'express';
import { AccountDocument } from '../../../../models/Account';
import GithubService from '../../../../services/GithubServices';
import { AccountService } from '../../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../../util/messages';
import { getAccountByEmail, getInteraction, saveInteraction } from '../../../../util/oidc';
import { AccountVariant } from '../../../../types/enums/AccountVariant';

async function updateTokens(account: AccountDocument, tokens: any): Promise<AccountDocument> {

    account.githubAccessToken = tokens.access_token || account.githubAccessToken;
    account.githubRefreshToken = tokens.refresh_token || account.githubRefreshToken;
    account.githubAccessTokenExpires =
        Date.now() + Number(tokens.expires_in) * 1000 || account.githubAccessTokenExpires;

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
    const tokens = await GithubService.requestTokens(code);
    console.log(tokens)

    const user = await GithubService.getUser(tokens.access_token);
    const email = user.id + '@github.thx.network';

    // Get the interaction based on the state
    const interaction = await getInteraction(uid);

    // Check if there is an active session for this interaction
    const account =
        interaction.session && interaction.session.accountId
            ? // If so, get account for sub
              await getAccountBySub(interaction.session.accountId)
            : // If not, get account for email claim
              await getAccountByEmail(email, AccountVariant.SSOGithub);

    // Actions after successfully login
    await AccountService.update(account, {
        lastLoginAt: Date.now(),
    });

    const returnTo = await saveInteraction(interaction, account._id.toString());

    await updateTokens(account, tokens);

    return res.redirect(returnTo);
}

export default { controller };
