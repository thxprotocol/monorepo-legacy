import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, AUTH_URL, PKG_ENV } from './secrets';
import { THXClient } from '@thxnetwork/sdk/client';

const config = {
    env: PKG_ENV,
    clientId: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    scopes: 'openid account:read erc20:read erc721:read point_balances:read referral_rewards:read point_rewards:read wallets:read pools:read',
    automaticSilentRenew: true,
    post_logout_redirect_uri: AUTH_URL,
    silent_redirect_uri: `${AUTH_URL}/silent-renew.html`,
};

const thxClient = new THXClient(config);

export { thxClient };
