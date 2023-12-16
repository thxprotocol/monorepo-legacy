import axios from 'axios';
import { THXClient } from '../clients';
import { THXOIDCConfig, THXOIDCUser } from '../types';
import BaseManager from './BaseManager';

export enum THXOIDCGrant {
    AuthorizationCode = 'authorization_code',
    ClientCredentials = 'client_credentials',
}

class OIDCManager extends BaseManager {
    user: THXOIDCUser | null;
    expiresAt: number;

    constructor(client: THXClient) {
        super(client);

        this.expiresAt = Date.now();
        this.user = null;
    }

    get isExpired() {
        return Date.now() > this.expiresAt;
    }

    get isAuthenticated() {
        return this.user && !this.isExpired;
    }

    async authenticate() {
        const initMap = {
            [String(THXOIDCGrant.ClientCredentials)]: this.getClientCredentialsGrant.bind(this),
            [String(THXOIDCGrant.AuthorizationCode)]: this.getAuthorizationCodeGrant.bind(this),
        };

        const grantType = this.client.options.returnUrl
            ? THXOIDCGrant.AuthorizationCode
            : THXOIDCGrant.ClientCredentials;

        await initMap[grantType](this.client.options);
    }

    async getClientCredentialsGrant({ clientId, clientSecret, issuer }: THXOIDCConfig) {
        const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader,
        };
        const url = `${issuer || 'https://auth.thx.network'}/token`;
        const params = new URLSearchParams({ grant_type: THXOIDCGrant.ClientCredentials, scope: 'openid' });
        const response = await axios({
            method: 'POST',
            url,
            headers,
            data: params,
        });

        this.user = response.data as THXOIDCUser;
        this.expiresAt = Date.now() + this.user.expires_in * 1000;
    }

    async getAuthorizationCodeGrant(options: THXOIDCConfig) {
        console.debug('Sorry! Not implemented yet...', options);
    }

    getUser() {
        return this.user;
    }

    // Deprecated
    setAccessToken(accessToken: string) {
        this.user = { access_token: accessToken } as THXOIDCUser;
    }
}

export default OIDCManager;
