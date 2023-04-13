import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { THXError } from './errors';
import { API_URL, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_URL } from '../config/secrets';

class ApiAccesTokenRequestError extends THXError {
    message = 'API access token request failed';
}

let apiAccessToken = '';
let apiAccessTokenExpired = 0;

async function requestAuthAccessToken() {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('resource', API_URL);
    data.append('scope', 'openid brands:read claims:read wallets:read wallets:write pools:write pools:read');
    const r = await axios({
        baseURL: AUTH_URL,
        url: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${AUTH_CLIENT_ID}:${AUTH_CLIENT_SECRET}`).toString('base64'),
        },
        data,
    });

    if (r.status !== 200) throw new ApiAccesTokenRequestError();
    return r.data;
}

export async function getAuthAccessToken() {
    if (Date.now() > apiAccessTokenExpired) {
        const { access_token, expires_in } = await requestAuthAccessToken();
        apiAccessToken = access_token;
        apiAccessTokenExpired = Date.now() + expires_in * 1000;
    }

    return `Bearer ${apiAccessToken}`;
}

export async function apiClient(config: AxiosRequestConfig) {
    const authHeader = await getAuthAccessToken();
    if (!config.headers) config.headers = {};
    config.headers['Authorization'] = authHeader;
    config.baseURL = API_URL;
    return axios(config);
}
