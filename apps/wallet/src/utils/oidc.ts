import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, BASE_URL } from './secrets';
import { Client as THXClient } from '@thxnetwork/sdk/client';

// Set the config in localstorage, so we can access it from the silent renew iframe
//localStorage.setItem('thx:wallet:oidc', JSON.stringify(config));

const thxClient = new THXClient({
    redirectUrl: `${BASE_URL}/signin-oidc`,
    clientId: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    scopes: 'openid rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read transactions:read relay:write swaprule:read swap:read swap:write wallets:read wallets:write',
    automaticSilentRenew: true,
    silent_redirect_uri: `${BASE_URL}/silent-renew.html`,
});
thxClient.init();
export { thxClient };
