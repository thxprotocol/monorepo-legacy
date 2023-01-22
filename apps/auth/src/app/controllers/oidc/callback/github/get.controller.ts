import { Request, Response } from 'express';
import { AccountDocument } from '../../../../models/Account';
import GithubService from '../../../../services/GithubServices';
import { AccountService } from '../../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../../util/messages';
import { getAccountByEmail, getInteraction, saveInteraction } from '../../../../util/oidc';
import { AccountVariant } from '../../../../types/enums/AccountVariant';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import airtable from '@thxnetwork/auth/util/airtable';

async function updateTokens(account: AccountDocument, tokens: any, userId: string): Promise<AccountDocument> {
    const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;

    account.setToken({
        kind: AccessTokenKind.Github,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiry,
        userId,
    } as IAccessToken);

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

    const user = await GithubService.getUser(tokens.access_token);

    // Get the interaction based on the state
    const interaction = await getInteraction(uid);

    // Check if there is an active session for this interaction
    const account =
        interaction.session && interaction.session.accountId
            ? // If so, get account for sub
              await getAccountBySub(interaction.session.accountId)
            : // If not, get account for email claim
              await getAccountByEmail(user.email, AccountVariant.SSOGithub);

    await airtable.pipelineSignup({
        Email: account.email,
        Date: account.createdAt,
        AcceptUpdates: account.acceptUpdates,
    });

    // Actions after successfully login
    await AccountService.update(account, {
        lastLoginAt: Date.now(),
    });

    const returnTo = await saveInteraction(interaction, account._id.toString());

    await updateTokens(account, tokens, user.id);

    return res.redirect(returnTo);
}

export default { controller };
