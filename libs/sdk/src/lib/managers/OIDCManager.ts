import fetch, { Headers } from 'node-fetch';
import { THXClient } from '../clients';
import { THXOIDCConfig, THXOIDCUser } from '../types';
import { THXOIDCGrant } from '../types/enums/Grant';

export default class OIDCManager {
    client: THXClient;
    user: THXOIDCUser | null;
    issuer: string;
    expiresAt: number;

    constructor(client: THXClient) {
        this.client = client;
        this.issuer = client.options.issuer || 'https://auth.thx.network';
        this.expiresAt = Date.now();
        this.user = null;
    }

    get isExpired() {
        return Date.now() > this.expiresAt;
    }

    get isAuthenticated() {
        return this.user && !this.isExpired;
    }

    async init() {
        const initMap = {
            [THXOIDCGrant.ClientCredentials]: this.getClientCredentialsGrant,
            [THXOIDCGrant.AuthorizationCode]: this.getAuthorizationCodeGrant,
        };

        if (!this.client.options.grantType) {
            throw new Error("Please, set 'options.grantType' to client_credentials or authorization_code.");
        }

        await initMap[this.client.options.grantType](this.client.options);
    }

    async getClientCredentialsGrant({ scope, clientId, clientSecret }: THXOIDCConfig) {
        const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader,
        });
        const body = new URLSearchParams({ grant_type: 'client_credentials', scope });
        const response = await fetch(`${this.issuer}/token`, {
            method: 'POST',
            headers,
            body,
        });
        const user = await response.json();

        this.user = user as THXOIDCUser;
        this.expiresAt = Date.now() + this.user.expires_in * 1000;
    }

    async getAuthorizationCodeGrant(options: THXOIDCConfig) {
        console.debug('Sorry! Not implemented yet...', options);
    }

    // Deprecated
    setAccessToken(accessToken: string) {
        this.user = { access_token: accessToken } as THXOIDCUser;
    }
}
