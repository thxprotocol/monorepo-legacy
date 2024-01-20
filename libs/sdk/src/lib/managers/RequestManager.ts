import { THXClient } from '../clients';
import { THXBrowserClientOptions, THXRequestConfig } from '../types';
import * as jose from 'jose';
import axios, { AxiosError, AxiosResponse } from 'axios';
import OIDCManager, { THXOIDCGrant } from './OIDCManager';

class RequestManager extends OIDCManager {
    constructor(client: THXClient, grantType: THXOIDCGrant) {
        super(client, grantType);
    }

    get(path: string, config?: THXRequestConfig) {
        return this.request(path, { ...config, method: 'GET' });
    }

    post(path: string, config?: THXRequestConfig) {
        return this.request(path, { ...config, method: 'POST' });
    }

    patch(path: string, config?: THXRequestConfig) {
        return this.request(path, { ...config, method: 'PATCH' });
    }

    put(path: string, config?: THXRequestConfig) {
        return this.request(path, { ...config, method: 'PUT' });
    }

    delete(path: string, config?: THXRequestConfig) {
        return this.request(path, { ...config, method: 'DELETE' });
    }

    get apiUrl() {
        return this.client.options.apiUrl || 'https://api.thx.network';
    }

    private async request(path: string, config: THXRequestConfig) {
        // Check for user to exist and token not to be expired if auth is intended
        const { clientId, clientSecret } = this.client.options;
        if (!this.isAuthenticated && clientId && clientSecret) {
            await this.authenticate();
        }

        const headers = this.getHeaders(config);
        const url = `${this.apiUrl}${path}`;
        try {
            const response = await axios({ ...config, url, headers });

            return await this.handleResponse(response);
        } catch (error) {
            return await this.handleError(error as AxiosError);
        }
    }

    private getHeaders(config?: THXRequestConfig) {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (this.user && this.user.access_token) {
            const token = this.validateToken(this.user.access_token);
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Needs refactor in places where X-PoolId is as config.poolId or config header
        const options = this.client.options as THXBrowserClientOptions;
        if ((config && config.poolId) || (options && options.poolId)) {
            headers['X-PoolId'] = (config && config.poolId) || (options && options.poolId);
        }

        return { ...headers, ...config?.headers };
    }

    private async handleResponse(r: AxiosResponse) {
        // Return response data, but throw if HTTP status with the range of 400 - 600
        if (r.status >= 400 && r.status < 600) {
            throw r.data;
        } else {
            return r.data;
        }
    }

    private async handleError(error: AxiosError) {
        if (!error || !error.response) throw new Error('Could not parse failed response.');
        throw error.response.data;
    }

    private validateToken(accessToken: string) {
        if (!accessToken) throw new Error("Please, provide an 'accessToken'.");

        try {
            const { exp } = jose.decodeJwt(accessToken);
            if (!exp || Date.now() > Number(exp) * 1000) {
                throw new Error('The token has expired.');
            }

            return accessToken;
        } catch (error) {
            throw new Error("Failed to validate this 'accessToken'.");
        }
    }
}

export default RequestManager;
