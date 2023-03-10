import nock from 'nock';
import { getToken, jwksResponse } from './constants';
import { API_URL, AUTH_URL } from '../../config/secrets';

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

export const mockWalletProxy = () => {
    const token = getToken('openid account:read account:write');
    mockAuthPath('get', '/jwks', 200, jwksResponse);
    mockAuthPath('post', '/token', 200, async () => {
        return { access_token: token };
    });

    mockApiPath(
        'get',
        `/v1/wallets`,
        200,
        async () => {
            return [];
        },
        true, // mocks the entire url regardless of the passed query string:
    );

    mockApiPath('post', `/v1/wallets`, 200, async () => {
        return true;
    });
};

export function mockClear() {
    return nock.cleanAll();
}
