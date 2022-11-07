import nock from 'nock';
import { getToken, jwksResponse } from './jwt';
import { API_URL, AUTH_URL } from '@thxnetwork/auth/config/secrets';

export function mockAuthPath(method: string, path: string, status: number, callback: any = {}) {
    const n = nock(AUTH_URL).persist() as any;
    return n[method](path).reply(status, callback);
}

export function mockApiPath(method: string, path: string, status: number, callback: any = {}, query?: any) {
    const n = nock(API_URL).persist() as any;

    const interceptor = n[method](path);
    if (query) {
        interceptor.query(query);
    }
    return interceptor.reply(status, callback);
}

export function mockUrl(method: string, baseUrl: string, path: string, status: number, callback: any = {}) {
    const n = nock(baseUrl).persist() as any;
    return n[method](path).reply(status, callback);
}

export function mockWalletProxy() {
    mockAuthPath('get', '/jwks', 200, jwksResponse);
    mockAuthPath('post', '/token', 200, async () => {
        return {
            access_token: getToken('openid account:read account:write'),
        };
    });

    mockApiPath(
        'get',
        `/v1/wallets`,
        200,
        async () => {
            return [];
        },
        true,
    );

    mockApiPath('post', `/v1/wallets`, 200, async () => {
        return true;
    });
}

export function mockClear() {
    return nock.cleanAll();
}
