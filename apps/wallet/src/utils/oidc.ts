import { UserManagerSettings } from 'oidc-client-ts';
import { API_ROOT, AUTH_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, BASE_URL } from './secrets';

const config: UserManagerSettings = {
    authority: AUTH_URL,
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uri: `${BASE_URL}/signin-oidc`,
    response_type: 'code',
    post_logout_redirect_uri: BASE_URL,
    silent_redirect_uri: `${BASE_URL}/silent-renew.html`,
    automaticSilentRenew: true,
    loadUserInfo: false,
    resource: API_ROOT,
    scope:
        'openid offline_access rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read transactions:read relay:write swaprule:read swap:read swap:write',
};

// Set the config in localstorage, so we can access it from the silent renew iframe
localStorage.setItem('thx:wallet:oidc', JSON.stringify(config));

export { config };
