import MongoAdapter from '../util/adapter';
import { Account } from '../models/Account';
import { AccountDocument } from '../models/Account';
import { API_URL, INITIAL_ACCESS_TOKEN, NODE_ENV, SECURE_KEY } from '../util/secrets';
import { Configuration, interactionPolicy } from 'oidc-provider';
import { getJwks } from '../util/jwks';

const basePolicy = interactionPolicy.base();
const promptReset = new interactionPolicy.Prompt({ name: 'reset', requestable: true });
const promptCreate = new interactionPolicy.Prompt({ name: 'create', requestable: true });
const promptConfirm = new interactionPolicy.Prompt({ name: 'confirm', requestable: true });
const promptVerifyEmail = new interactionPolicy.Prompt({ name: 'verify_email', requestable: true });
const promptConnect = new interactionPolicy.Prompt({ name: 'connect', requestable: true });
const promptAccount = new interactionPolicy.Prompt({ name: 'account-settings', requestable: true });
const promtotp = new interactionPolicy.Prompt({ name: 'totp-setup', requestable: true });

basePolicy.add(promptCreate);
basePolicy.add(promptConfirm);
basePolicy.add(promptVerifyEmail);
basePolicy.add(promptConnect);
basePolicy.add(promptReset);
basePolicy.add(promptAccount);
basePolicy.add(promtotp);
basePolicy.remove('consent');

// Configuration defaults:
// https://github.com/panva/node-oidc-provider/blob/master/lib/helpers/defaults.js

const keys = [SECURE_KEY.split(',')[0], SECURE_KEY.split(',')[1]];
const config: Configuration = {
    jwks: getJwks(),
    adapter: MongoAdapter,
    loadExistingGrant: async (ctx) => {
        const grant = new ctx.oidc.provider.Grant({
            clientId: ctx.oidc.client.clientId,
            accountId: ctx.oidc.session.accountId,
        });

        grant.addOIDCScope('openid offline_access');
        grant.addOIDCClaims(['sub', 'email']);
        grant.addResourceScope(API_URL, ctx.oidc.client.scope);
        await grant.save();
        return grant;
    },
    async findAccount(ctx: any, sub: string) {
        const account: AccountDocument = await Account.findById(sub);

        return {
            accountId: sub,
            claims: () => {
                return {
                    sub,
                    ...account.toJSON(),
                };
            },
        };
    },
    extraParams: [
        'claim_id',
        'reward_hash',
        'signup_email',
        'return_url',
        'signup_token',
        'authentication_token',
        'secure_key',
        'password_reset_token',
        'prompt',
        'channel',
        'verifyEmailToken',
    ],
    scopes: [
        'openid',
        'offline_access',
        'account:read',
        'account:write',
        'brands:read',
        'brands:write',
        'pools:read',
        'pools:write',
        'rewards:read',
        'rewards:write',
        'members:read',
        'members:write',
        'memberships:read',
        'memberships:write',
        'withdrawals:read',
        'withdrawals:write',
        'deposits:read',
        'deposits:write',
        'erc20:read',
        'erc20:write',
        'erc721:read',
        'erc721:write',
        'promotions:read',
        'promotions:write',
        'transactions:read',
        'transactions:write',
        'payments:read',
        'payments:write',
        'widgets:write',
        'widgets:read',
        'relay:write',
        'metrics:read',
        'swaprule:read',
        'swaprule:write',
        'swap:read',
        'swap:write',
        'claims:write',
        'claims:read',
        'clients:write',
        'clients:read',
    ],
    claims: {
        openid: ['sub', 'email', 'variant', 'address'],
    },
    ttl: {
        Interaction: 1 * 60 * 60, // 1 hour in seconds,
        Session: 24 * 60 * 60, // 24 hours in seconds,
        Grant: 1 * 60 * 60, // 1 hour in seconds
        IdToken: 1 * 60 * 60, // 1 hour in seconds
        AccessToken: 1 * 60 * 60, // 1 hour in seconds
        AuthorizationCode: 10 * 60, // 10 minutes in seconds
        ClientCredentials: 10 * 60, // 10 minutes in seconds
    },
    interactions: {
        policy: basePolicy,
        url(ctx: any, interaction: any) {
            return `/oidc/${interaction.uid}`;
        },
    },
    features: {
        devInteractions: { enabled: false },
        clientCredentials: { enabled: true },
        encryption: { enabled: true },
        introspection: { enabled: true },
        registration: { enabled: true, initialAccessToken: INITIAL_ACCESS_TOKEN },
        registrationManagement: { enabled: true },
        resourceIndicators: {
            enabled: true,
            defaultResource: () => API_URL,
            getResourceServerInfo: async (ctx, resourceIndicator, client) => {
                return {
                    scope: client.scope,
                    audience: client.clientId,
                    accessTokenTTL: 1 * 60 * 60,
                    accessTokenFormat: 'jwt',
                };
            },
            useGrantedResource: () => true,
        },
        rpInitiatedLogout: {
            enabled: true,
            logoutSource: async (ctx: any, form: any) => {
                ctx.body = `<!DOCTYPE html>
                <head>
                <title>Logout</title>
                </head>
                <body>
                ${form}
                <script src="/js/logout.js"></script>
                </body>
                </html>`;
            },
        },
    },
    cookies: {
        long: { signed: true, secure: true, sameSite: 'none' },
        short: { signed: true, secure: true, sameSite: 'none' },
        keys,
    },
};

if (NODE_ENV === 'test') {
    config.pkce = {
        methods: ['S256'],
        required: () => false,
    };
    config.cookies.long = undefined;
    config.cookies.short = undefined;
}
export default config;
