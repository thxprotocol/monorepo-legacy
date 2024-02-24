import MongoAdapter from '../util/adapter';
import { Account } from '../models/Account';
import { AccountDocument } from '../models/Account';
import { API_URL, INITIAL_ACCESS_TOKEN, NODE_ENV, SECURE_KEY } from '@thxnetwork/auth/config/secrets';
import { Configuration, interactionPolicy } from 'oidc-provider';
import { getJwks } from '../util/jwks';

const basePolicy = interactionPolicy.base();
const promptAuth = new interactionPolicy.Prompt({ name: 'auth', requestable: true });
const promptVerifyEmail = new interactionPolicy.Prompt({ name: 'verify_email', requestable: true });
const promptConnect = new interactionPolicy.Prompt({ name: 'connect', requestable: true });
const promptAccount = new interactionPolicy.Prompt({ name: 'account-settings', requestable: true });
basePolicy.add(promptAuth);
basePolicy.add(promptVerifyEmail);
basePolicy.add(promptConnect);
basePolicy.add(promptAccount);

// Consent prompt is a requirement for refresh_token grant
// so we only remove the checks and not the prompt
basePolicy.get('consent').checks.clear();

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
    routes: {
        authorization: '/authorize',
    },
    extraParams: [
        'pool_id',
        'claim_id',
        'return_url',
        'signup_email',
        'signup_plan',
        'signup_offer',
        'verifyEmailToken',
        'prompt',
        'collaborator_request_token',
        'referral_code',
        'access_token_kind',
        'provider_scope',
        'auth_variant',
        'auth_signature',
        'auth_message',
        'auth_email',
    ],
    scopes: [
        'openid',
        'offline_access',
        'account:read',
        'account:write',
        'accounts:read',
        'accounts:write',
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
        'erc1155:read',
        'erc1155:write',
        'promotions:read',
        'promotions:write',
        'point_balances:read',
        'point_balances:write',
        'point_rewards:read',
        'point_rewards:write',
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
        'wallets:read',
        'wallets:write',
        'webhooks:read',
        'webhooks:write',
        'web3_quests:read',
        'web3_quests:write',
        'custom_rewards:read',
        'custom_rewards:write',
        'coupon_rewards:read',
        'coupon_rewards:write',
        'discord_role_rewards:read',
        'discord_role_rewards:write',
        'erc20_rewards:read',
        'erc20_rewards:write',
        'erc721_rewards:read',
        'erc721_rewards:write',
        'referral_rewards:read',
        'referral_rewards:write',
        'referal_reward_claims:read',
        'referal_reward_claims:write',
        'pool_analytics:read',
        'pool_subscription:read',
        'pool_subscription:write',
        'merchants:write',
        'merchants:read',
        'identities:write',
        'identities:read',
        'events:write',
        'events:read',
    ],
    claims: {
        openid: ['sub', 'email', 'variant', 'address'],
    },
    ttl: {
        Interaction: 24 * 60 * 60, // 24 hours in seconds
        Session: 24 * 60 * 60, // 24 hours in seconds
        Grant: 24 * 60 * 60, // 24 hours in seconds
        IdToken: 24 * 60 * 60, // 24 hours in seconds
        RefreshToken: 24 * 60 * 60, // 24 hours in seconds
        AccessToken: 24 * 60 * 60, // 24 hours in seconds,
        AuthorizationCode: 10 * 60, // 10 minutes in seconds
        ClientCredentials: 1 * 60 * 60, // 10 minutes in seconds
    },
    interactions: {
        policy: basePolicy,
        url(ctx: any, interaction: any) {
            return `/oidc/${interaction.uid}`;
        },
    },
    features: {
        userinfo: { enabled: false },
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
