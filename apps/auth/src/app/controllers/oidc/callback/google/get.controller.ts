import { AccountService } from '../../../../services/AccountService';
import { Request, Response, NextFunction } from 'express';
import { oidc } from '../../../../util/oidc';
import { parseJwt } from '../../../../util/jwt';
import { Account, AccountDocument } from '../../../../models/Account';
import { getAccountByEmail, saveInteraction } from '../../../../util/oidc';
import { YouTubeService } from '../../../../services/YouTubeService';
import { AccountVariant } from '../../../../types/enums/AccountVariant';
import { createWallet } from '@thxnetwork/auth/util/wallet';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import airtable from '@thxnetwork/auth/util/airtable';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';

const callbackPreAuth = async (req: Request) => {
    // Get code from url
    const code = req.query.code as string;
    // Throw error if not exists
    if (!code) throw new UnauthorizedError('Could not find code in query');

    // Get interaction for state first
    const uid = req.query.state as string;
    if (!uid) throw new UnauthorizedError('Could not find state in query');
    // See if it still exists and throw error if not

    const interaction = await oidc.Interaction.find(uid);
    if (!interaction) throw new UnauthorizedError('Your session has expired.');

    return { interaction, code };
};

const callbackPostAuth = async (interaction, account: AccountDocument) => {
    // Update interaction with login state
    interaction.result = { login: { accountId: String(account._id) } };
    await interaction.save(Date.now() + 10000);

    // Create a wallet if wallet can not be found for user
    createWallet(account);
    console.log(interaction);
    return interaction.prompt.name === 'connect' ? interaction.params.return_url : interaction.returnTo;
};

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);

    // Get Tokens
    const { tokenInfo, email } = await YouTubeService.getTokens(code);
    console.log(tokenInfo);

    // Check if there is an active session for this interaction
    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSOGoogle, email);
    if (!account) throw new UnauthorizedError('Could not find or create an account');

    // Set tokens with correct kind and userId for account
    const returnUrl = await callbackPostAuth(interaction, account);
    console.log(returnUrl);

    res.redirect(returnUrl);
}

export default { controller };
