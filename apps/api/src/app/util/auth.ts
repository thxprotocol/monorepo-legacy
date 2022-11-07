import axios from 'axios';
import { THXError } from './errors';
import { AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_URL } from '@thxnetwork/api/config/secrets';

class AuthAccesTokenRequestError extends THXError {
    message = 'Auth access token request failed';
}

let authAccessToken = '';
let authAccessTokenExpires = 0;

axios.defaults.baseURL = AUTH_URL;

async function requestAuthAccessToken() {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('scope', 'openid accounts:read accounts:write');

    const r = await axios({
        url: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${AUTH_CLIENT_ID}:${AUTH_CLIENT_SECRET}`).toString('base64'),
        },
        data,
    });

    if (r.status !== 200) throw new AuthAccesTokenRequestError();

    return r.data;
}

export async function getAuthAccessToken() {
    if (Date.now() > authAccessTokenExpires) {
        const { access_token, expires_in } = await requestAuthAccessToken();
        authAccessToken = access_token;
        authAccessTokenExpires = Date.now() + expires_in * 1000;
    }

    return `Bearer ${authAccessToken}`;
}

export const authClient = axios;
