import Jwtmock from './jwtmock';

export const accountAddress = '0x287aAa0f0089069A115AF9D25f0adeB295b52964';
export const accountEmail = 'test@test.com';
export const accountSecret = 'mellon';
export const clientId = 'xxxxxxx';
export const sub = '6074cbdd1459355fae4b6a14';
export const sub2 = '6074cbdd1459355fae4b6a15';

export const dashboardScopes =
    'openid pools:read pools:write erc20:write erc20:read erc721:write erc721:read rewards:read rewards:write deposits:read deposits:write promotions:read promotions:write widgets:write widgets:read transactions:read swaprule:read swaprule:write claims:read';
export const dashboardAccessToken = Jwtmock.getToken(dashboardScopes);
export const walletScopes =
    'openid rewards:read erc20:read erc721:read withdrawals:read withdrawals:write deposits:read deposits:write account:read account:write memberships:read memberships:write promotions:read payments:write payments:read relay:write transactions:read transactions:write swap:read swap:write swaprule:read claims:read wallets:read wallets:write';
export const walletAccessToken = Jwtmock.getToken(walletScopes);
export const walletAccessToken2 = Jwtmock.getToken(walletScopes, sub);
