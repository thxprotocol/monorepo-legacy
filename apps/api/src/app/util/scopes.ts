export const openId = 'openid';
export const adminScopes = [
    'account:read',
    'account:write',
    'members:read',
    'members:write',
    'withdrawals:write',
    'rewards:read',
    'wallets:read',
    'wallets:write',
    'erc20_rewards:read',
    'erc721_rewards:read',
    'referral_rewards:read',
];
export const dashboardScopes = [
    'asset_pools:read',
    'asset_pools:write',
    'rewards:read',
    'rewards:write',
    'deposits:read',
    'deposits:write',
    'promotions:read',
    'promotions:write',
    'transactions:read',
    'claims:read',
    'swaprule:read',
    'swaprule:write',
    'erc20_rewards:read',
    'erc20_rewards:write',
    'erc721_rewards:read',
    'erc721_rewards:write',
    'referral_rewards:read',
    'referral_rewards:write',
    'pool_subscription:read',
];
export const userScopes = [
    'asset_pools:read',
    'asset_pools:write',
    'rewards:read',
    'withdrawals:read',
    'deposits:read',
    'deposits:write',
    'transactions:read',
    'transactions:write',
    'claims:read',
    'swaprule:read',
    'swap:read',
    'swap:write',
    'erc20_rewards:read',
    'erc721_rewards:read',
    'referral_rewards:read',
    'referal_reward_claims:read',
    'referal_reward_claims:write',
];

export const opneIdAdminScopes = `${openId} ${adminScopes.join(' ')}`;
export const openIdDashboardScopes = `${openId} ${dashboardScopes.join(' ')}`;
export const openIdUserScopes = `${openId} ${userScopes.join(' ')}`;

export const adminDashboardScopes = Array.from(new Set([...adminScopes, ...dashboardScopes]));
export const userDashboardScopes = Array.from(new Set([...userScopes, ...dashboardScopes]));
export const userAdminScopes = Array.from(new Set([...adminScopes, ...userScopes]));
export const userAdminDashboardScopes = Array.from(new Set([...adminScopes, ...userScopes, ...dashboardScopes]));
