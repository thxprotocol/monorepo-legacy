import { oidc } from '@thxnetwork/auth/util/oidc';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { createWallet } from '@thxnetwork/auth/util/wallet';
import { Request, Response } from 'express';
import { hubspot } from '@thxnetwork/auth/util/hubspot';
import { DASHBOARD_URL } from '@thxnetwork/auth/config/secrets';
import PoolProxy from '@thxnetwork/auth/proxies/PoolProxy';

export const callbackPreAuth = async (req: Request) => {
    // Get code from url
    const code = req.query.code as string;
    // Throw error if not exists
    if (!code) throw new UnauthorizedError('Could not find code in query');

    // Get interaction for state first
    const uid = req.query.state as string;
    if (!uid) throw new UnauthorizedError('Could not find state in query');

    // See if interaction still exists and throw error if not
    const interaction = await oidc.Interaction.find(uid);
    if (!interaction) throw new UnauthorizedError('Your session has expired.');

    return { interaction, code };
};

export const callbackPostSSOCallback = async (interaction, account: AccountDocument) => {
    if (!account) throw new UnauthorizedError('Could not find or create an account');

    // Update interaction with login state
    interaction.result = { login: { accountId: String(account._id) } };
    await interaction.save(Date.now() + 10000);

    return await callbackPostAuth(account, interaction);
};

export const callbackPostAuth = async (
    account: AccountDocument,
    { params, returnTo, prompt }: { params; returnTo; prompt },
) => {
    const returnUrl = prompt.name === 'connect' ? params.return_url : returnTo;
    if (returnUrl.startsWith(DASHBOARD_URL)) {
        hubspot.upsert({ email: account.email });
    }

    // Create a wallet if wallet can not be found for user
    createWallet(account);

    if (params.pool_id && params.pool_transfer_token) {
        await PoolProxy.transferOwnership(account, params.pool_id, params.pool_transfer_token);
    }

    return returnUrl;
};

async function controller(req: Request, res: Response) {
    const interaction = await oidc.interactionDetails(req, res);
    const { uid, prompt, params } = interaction;

    // Prompt params are used for unauthenticated routes
    switch (params.prompt) {
        case 'verify_email': {
            return res.redirect(`/oidc/${uid}/account/email/verify`);
        }
        case 'account-settings': {
            return res.redirect(`/oidc/${uid}/account`);
        }
    }

    // Regular prompts are used for authenticated routes
    switch (prompt.name) {
        case 'connect': {
            return res.redirect(`/oidc/${uid}/connect`);
        }
        case 'login': {
            return res.redirect(`/oidc/${uid}/signin`);
        }
    }
}

export default { controller };
