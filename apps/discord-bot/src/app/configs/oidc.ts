import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, AUTH_URL, PKG_ENV } from './secrets';
import { THXClient } from '@thxnetwork/sdk/client';

const config = {
    env: PKG_ENV,
    redirectUrl: `${AUTH_URL}/signin-oidc`,
    clientId: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    scopes: 'openid offline_access rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read transactions:read relay:write swaprule:read swap:read swap:write claims:read wallets:read wallets:write',
    automaticSilentRenew: true,
    post_logout_redirect_uri: AUTH_URL,
    silent_redirect_uri: `${AUTH_URL}/silent-renew.html`,
};
localStorage.setItem('thx:wallet:oidc', JSON.stringify(config));

const thxClient = new THXClient(config);

export { thxClient };
