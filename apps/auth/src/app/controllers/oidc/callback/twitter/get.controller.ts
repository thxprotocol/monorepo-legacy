import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { TwitterService } from '../../../../services/TwitterService';
import { getAccountByTwitterId, getInteraction, saveInteraction } from '../../../../util/oidc';
import { createWallet } from '../../../../util/wallet';

async function updateTokens(account: AccountDocument, tokens): Promise<AccountDocument> {
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Twitter);
    const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
    if (!token) {
        account.createToken({
            kind: AccessTokenKind.Twitter,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry,
        } as IAccessToken);
    } else {
        account.updateToken(AccessTokenKind.Twitter, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry,
        });
    }

    return await account.save();
}

export async function controller(req: Request, res: Response) {
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
              await AccountService.get(interaction.session.accountId)
            : // If not, get account for email claim
              await getAccountByTwitterId(user.id);

    //Check if a SharedWallet must be created for a specific chainId
    createWallet(String(account._id));

    // Set successful login state
    const returnTo = await saveInteraction(interaction, account._id.toString());

    await updateTokens(account, tokens);
    await account.updateOne({ lastLoginAt: Date.now() });

    return res.redirect(returnTo);
}

export default { controller };
