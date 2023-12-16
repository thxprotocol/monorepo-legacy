import { THXClient } from '../clients';
import { THXBrowserClientOptions, THXRequestConfig } from '../types';
import * as jose from 'jose';
import axios, { AxiosResponse } from 'axios';
import OIDCManager from './OIDCManager';

class RequestManager extends OIDCManager {
    constructor(client: THXClient) {
        super(client);
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

    private async request(path: string, config: THXRequestConfig) {
        // Check for user to exist and token not to be expired
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        const headers = this.getHeaders(config);
        const url = this.getUrl(path);
        const response = await axios({ ...config, url, headers });

        return await this.handleResponse(response);
    }

    private validateToken(accessToken: string) {
        try {
            if (!accessToken) {
                throw new Error('no access token');
            }

            const { exp } = jose.decodeJwt(accessToken);
            if (!exp || Date.now() > Number(exp) * 1000) {
                throw new Error('token expired');
            }

            return accessToken;
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    private getUrl(path: string) {
        return this.client.options.url + path;
    }

    private getHeaders(config?: THXRequestConfig) {
        if (!this.user) throw new Error('Could not find user.');

        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (this.user.access_token) {
            const token = this.validateToken(this.user.access_token);
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Needs refactor
        const options = this.client.options as THXBrowserClientOptions;
        if ((config && config.poolId) || (options && options.poolId)) {
            headers['X-PoolId'] = (config && config.poolId) || (options && options.poolId);
        }

        return headers;
    }

    private async handleResponse(r: AxiosResponse) {
        if (r.status >= 400 && r.status < 600) {
            throw r.data;
        } else {
            return r.data;
        }
    }
}

export default RequestManager;
