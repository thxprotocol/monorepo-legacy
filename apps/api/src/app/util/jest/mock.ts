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
    mockAuthPath('get', `/account/${sub}`, 200, account);
    mockAuthPath('patch', `/account/${sub}`, 204, {});
    mockAuthPath('get', `/account/email/${userEmail}`, 200, account);
    mockAuthPath('get', `/account/address/${userWalletAddress}`, 200, account);

    // Account 2 (Web Wallet)
    mockAuthPath('get', `/account/${sub2}`, 200, account2);
    mockAuthPath('patch', `/account/${sub2}`, 204, {});
    mockAuthPath('post', '/account', 200, account2);
    mockAuthPath('get', `/account/address/${userWalletAddress2}`, 200, account2);
    mockAuthPath('get', `/account/email/${userEmail2}`, 404, {});

    // Account 3
    mockAuthPath('get', `/account/${sub3}`, 200, account3);
    mockAuthPath('patch', `/account/${sub3}`, 204, account3);
}

export function mockClear() {
    return nock.cleanAll();
}
