import nock from 'nock';
import {
    userEmail2,
    clientId,
    clientSecret,
    registrationAccessToken,
    requestUris,
    userWalletAddress2,
    account2,
    sub2,
    account,
    sub,
    userEmail,
    userWalletAddress,
    sub3,
    account3,
    sub4,
    account4,
} from './constants';
import { getToken, jwksResponse } from './jwt';
import { AUTH_URL } from '@thxnetwork/api/config/secrets';

export function mockAuthPath(method: string, path: string, status: number, callback: any = {}) {
    const n = nock(AUTH_URL).persist() as any;
    return n[method](path).reply(status, callback);
}

export function mockUrl(method: string, baseUrl: string, path: string, status: number, callback: any = {}) {
    const n = nock(baseUrl).persist() as any;
    return n[method](path).reply(status, callback);
}

export function mockStart() {
    mockClear();
    mockAuthPath('get', '/jwks', 200, jwksResponse);
    mockAuthPath('post', '/token', 200, async () => {
        return {
            access_token: getToken('openid accounts:read accounts:write'),
        };
    });
    mockAuthPath('post', '/reg', 201, {
        client_id: clientId,
        registration_access_token: registrationAccessToken,
    });
    mockAuthPath('delete', `/reg/${clientId}?access_token=${registrationAccessToken}`, 204, {});
    mockAuthPath('get', `/reg/${clientId}?access_token=${registrationAccessToken}`, 200, {
        client_id: clientId,
        client_secret: clientSecret,
        request_uris: requestUris,
    });

    // mockAuthPath('get', `https://local.auth.thx.network/account?subs=${sub}`, 200, account);

    // Account 1 (Dashboard)
    mockAuthPath('get', `/accounts/${sub}`, 200, account);
    mockAuthPath('patch', `/accounts/${sub}`, 204, {});
    mockAuthPath('get', `/accounts/email/${userEmail}`, 200, account);
    mockAuthPath('get', `/accounts/address/${userWalletAddress}`, 200, account);

    // Account 2 (Web Wallet)
    mockAuthPath('get', `/accounts/${sub2}`, 200, account2);
    mockAuthPath('patch', `/accounts/${sub2}`, 204, {});
    mockAuthPath('post', '/accounts', 200, [account2]);
    mockAuthPath('get', `/accounts/address/${userWalletAddress2}`, 200, account2);
    mockAuthPath('get', `/accounts/email/${userEmail2}`, 404, {});

    // Account 3
    mockAuthPath('get', `/accounts/${sub3}`, 200, account3);
    mockAuthPath('patch', `/accounts/${sub3}`, 204, account3);

    // Account 4
    mockAuthPath('get', `/accounts/${sub4}`, 200, account4);
    mockAuthPath('patch', `/accounts/${sub4}`, 204, account4);
}

export function mockClear() {
    return nock.cleanAll();
}
