import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
import { API_URL, AUTH_URL, BASE_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET } from '@thxnetwork/dashboard/config/secrets';

export const ADMIN_SCOPE =
    'openid account:read account:write rewards:read members:read members:write withdrawals:write swap:read swap:write erc20_rewards:read erc721_rewards:read referral_rewards:read';

export const config: UserManagerSettings = {
    authority: AUTH_URL,
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uri: `${BASE_URL}/signin-oidc`,
    response_type: 'code',
    post_logout_redirect_uri: BASE_URL,
    silent_redirect_uri: `${BASE_URL}/silent-renew.html`,
    automaticSilentRenew: true,
    loadUserInfo: false,
    resource: API_URL,
    scope: 'openid account:read account:write pools:read pools:write erc20:read erc20:write erc721:read erc721:write erc1155:read erc1155:write rewards:read rewards:write withdrawals:read deposits:read deposits:write promotions:read promotions:write widgets:write widgets:read transactions:read members:read members:write payments:read payments:write swaprule:read swaprule:write claims:read brands:read brands:write clients:read clients:write erc20_rewards:read erc20_rewards:write erc721_rewards:read erc721_rewards:write referral_rewards:read referral_rewards:write merchants:write merchants:read webhooks:write webhooks:read custom_rewards:write custom_rewards:read coupon_rewards:write coupon_rewards:read web3_quests:write web3_quests:read discord_role_rewards:write discord_role_rewards:read',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
};
