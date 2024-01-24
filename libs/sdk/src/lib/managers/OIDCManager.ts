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
    grantType: THXOIDCGrant;

    constructor(client: THXClient, grantType: THXOIDCGrant) {
        super(client);

        this.grantType = grantType;
        this.expiresAt = Date.now();
        this.user = null;
    }

    get isExpired() {
        return Date.now() > this.expiresAt;
    }

    get isAuthenticated() {
        return this.user && !this.isExpired;
    }

    get authUrl() {
        return this.client.options.authUrl || 'https://auth.thx.network';
    }

    setUser(user: THXOIDCUser) {
        this.user = user;
        this.expiresAt = Date.now() + this.user.expires_in * 1000;
    }

    getUser() {
        return this.user;
    }

    async authenticate() {
        const initMap = {
            [String(THXOIDCGrant.ClientCredentials)]: this.getClientCredentialsGrant.bind(this),
            [String(THXOIDCGrant.AuthorizationCode)]: this.getAuthorizationCodeGrant.bind(this),
        };
        await initMap[this.grantType](this.client.options);
    }

    async redirectCallback() {
        // Once user is redirected back to your application with the authorization code
        const code = new URL(window.location.href).searchParams.get('code');
        if (!code) throw new Error("Could not find 'code' search param in url.");

        const { clientId, redirectUri } = this.client.options;
        const data = {
            code,
            grant_type: THXOIDCGrant.AuthorizationCode,
            client_id: clientId,
            redirect_uri: redirectUri,
        };

        try {
            const response = await axios(`${this.authUrl}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(data),
            });

            this.setUser(response.data);
        } catch (error) {
            throw new Error('Request for ' + THXOIDCGrant.ClientCredentials + ' grant failed.');
        }
    }

    private async getClientCredentialsGrant({ clientId, clientSecret }: THXOIDCConfig) {
        const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader,
        };
        const url = `${this.authUrl}/token`;
        const params = new URLSearchParams({
            grant_type: THXOIDCGrant.ClientCredentials,
            scope: 'openid events:write identities:read identities:write pools:read pools:write',
        });

        try {
            const response = await axios({
                method: 'POST',
                url,
                headers,
                data: params,
            });

            this.setUser(response.data);
        } catch (error) {
            console.log(error);
            throw new Error('Request for ' + THXOIDCGrant.ClientCredentials + ' grant failed.');
        }
    }

    private async getAuthorizationCodeGrant({ clientId, redirectUri }: THXOIDCConfig) {
        if (!redirectUri) throw new Error("Please, set 'options.redirectUri'.");

        const authorizationEndpoint = this.authUrl + '/authorize';
        const scope =
            'openid offline_access account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read';
        const authUrl = new URL(authorizationEndpoint);

        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('scope', scope);
        authUrl.searchParams.append('response_type', 'code');

        window.location.href = authUrl.toString();
    }
}

export default OIDCManager;
