import { API_URL, BASE_URL } from './secrets';

export const ADMIN_SCOPE =
    'openid account:read account:write rewards:read members:read members:write withdrawals:write swap:read swap:write';

export const config: any = {
    authority: process.env.VUE_APP_AUTH_URL,
    client_id: process.env.VUE_APP_OIDC_CLIENT_ID,
    client_secret: process.env.VUE_APP_OIDC_CLIENT_SECRET,
    redirect_uri: `${BASE_URL}/signin-oidc`,
    response_type: 'code',
    post_logout_redirect_uri: BASE_URL,
    silent_redirect_uri: `${BASE_URL}/silent-renew.html`,
    automaticSilentRenew: true,
    loadUserInfo: false,
    resource: API_URL,
    scope:
        'openid account:read pools:read pools:write erc20:read erc20:write erc721:read erc721:write rewards:read rewards:write withdrawals:read deposits:read deposits:write promotions:read promotions:write widgets:write widgets:read transactions:read members:read members:write payments:read payments:write swaprule:read swaprule:write claims:read brands:read brands:write clients:read clients:write',
};
