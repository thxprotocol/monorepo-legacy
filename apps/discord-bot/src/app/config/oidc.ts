import { API_URL, AUTH_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET } from '@thxnetwork/dashboard/config/secrets';
import { THXClient, THXOIDCClient } from '@thxnetwork/sdk/client';

const thxOIDCClient = new THXOIDCClient({
    clientId: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    issuer: AUTH_URL,
    grantType: 'client_credentials',
    scope: 'openid account:read erc20:read erc721:read point_balances:read referral_rewards:read point_rewards:read wallets:read pools:read pool_analytics:read',
});

const thxClient = ({ poolId }) => {
    const { access_token } = thxOIDCClient.user;
    return new THXClient({
        url: API_URL,
        accessToken: access_token,
        poolId,
    });
};

export { thxOIDCClient, thxClient };
