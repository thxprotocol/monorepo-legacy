import { AccountPlanType, AccountVariant } from '@thxnetwork/common/enums';
import { getToken } from './jwt';
import { toWei } from 'web3-utils';
import { CYPRESS_EMAIL } from '@thxnetwork/api/config/secrets';

export const tokenName = 'Volunteers United';
export const tokenSymbol = 'VUT';
export const tokenTotalSupply = toWei('100000000');
export const rewardWithdrawAmount = '1000';
export const rewardWithdrawDuration = 60;
export const rewardWithdrawUnlockDate = '2022-04-20';
export const COLLECTOR_PK = '0x794a8efb7e73278907197b0f65e1c32724810f0399e1a12feb1e6af6fb77dbff';
export const VOTER_PK = '0x97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9';
export const DEPOSITOR_PK = '0x5a05e38394194379795422d2e8c1d33e90033d90defec4880174c39198f707e3';
export const userEmail = CYPRESS_EMAIL;
export const userEmail2 = CYPRESS_EMAIL;
export const userPassword = 'mellonmellonmellon';
export const userPassword2 = 'mellonmellonmellon';
export const voterEmail = CYPRESS_EMAIL;
export const newAddress = '0x253cA584af3E458392982EF246066A6750Fa0735';
export const MaxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const sub = '6074cbdd1459355fae4b6a14';
export const sub2 = '6074cbdd1459355fae4b6a15';
export const sub3 = '6074cbdd1459355fae4b6a16';
export const sub4 = '6074cbdd1459355fae4b6a17';
export const userWalletAddress = '0x960911a62FdDf7BA84D0d3aD016EF7D15966F7Dc';
export const userWalletAddress2 = '0xaf9d56684466fcFcEA0a2B7fC137AB864d642946';
export const userWalletAddress3 = '0x861EFc0989DF42d793e3147214FfFcA4D124cAE8';
export const userWalletAddress4 = '0x6e781b0af6204c3dc23b4a7fe049202125a4f849';
export const userWalletPrivateKey = '0x794a8efb7e73278907197b0f65e1c32724810f0399e1a12feb1e6af6fb77dbff';
export const userWalletPrivateKey2 = '0x97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9';
export const userWalletPrivateKey3 = '0x5a05e38394194379795422d2e8c1d33e90033d90defec4880174c39198f707e3';
export const userWalletPrivateKey4 = '0x3b7fdd74a6c50a03d6e37f2d2c54e6fc73d67ff7d32858e55d80b2a5c9946b79';

export const account = {
    sub,
    plan: AccountPlanType.Lite,
    email: CYPRESS_EMAIL,
    address: userWalletAddress,
    tokens: [],
};
export const account2 = {
    sub: sub2,
    plan: AccountPlanType.Lite,
    email: CYPRESS_EMAIL,
    address: userWalletAddress2,
    tokens: [],
};

export const account3 = {
    sub: sub3,
    plan: AccountPlanType.Lite,
    variant: AccountVariant.EmailPassword,
    address: userWalletAddress3,
    tokens: [],
};

export const account4 = {
    sub: sub4,
    plan: AccountPlanType.Lite,
    variant: AccountVariant.Metamask,
    address: userWalletAddress4,
};

export const rewardId = 1;
export const requestUris = ['http://localhost:8080'];
export const redirectUris = ['http://localhost:8080'];
export const postLogoutRedirectUris = ['http://localhost:8080'];
export const clientId = 'xxxxxxx';
export const clientSecret = 'xxxxxxxxxxxxxx';
export const registrationAccessToken = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export const authScopes = 'wallets:read wallets:write';
export const dashboardScopes =
    'openid pools:read pools:write erc20:write erc20:read erc721:write erc721:read erc1155:write erc1155:read rewards:read rewards:write deposits:read deposits:write promotions:read promotions:write widgets:write widgets:read transactions:read swaprule:read swaprule:write claims:read  erc20_rewards:read erc20_rewards:write erc721_rewards:read erc721_rewards:write referral_rewards:read referral_rewards:write pool_subscription:read custom_rewards:write custom_rewards:read';
export const dashboardAccessToken = getToken(dashboardScopes);
export const dashboardAccessToken2 = getToken(dashboardScopes, sub2);
export const walletScopes =
    'openid rewards:read erc20:read erc721:read erc1155:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read payments:write payments:read relay:write transactions:read transactions:write swap:read swap:write swaprule:read claims:read wallets:read wallets:write erc20_rewards:read erc721_rewards:read referral_rewards:read point_balances:read';
export const widgetScopes =
    'openid offline_access account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read';
export const walletAccessToken = getToken(walletScopes);
export const walletAccessToken2 = getToken(walletScopes, sub);
export const walletAccessToken3 = getToken(walletScopes, sub2);
export const widgetAccessToken = getToken(widgetScopes, sub);
export const widgetAccessToken2 = getToken(widgetScopes, sub2);
export const widgetAccessToken3 = getToken(widgetScopes, sub3);
export const widgetAccessToken4 = getToken(widgetScopes, sub4);
export const authAccessToken = getToken(authScopes);
