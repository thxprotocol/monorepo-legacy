import { THXClient } from '../clients';
import BaseManager from './BaseManager';
import fetch, { Headers, HeadersInit, RequestInit, Response } from 'node-fetch';
import * as jose from 'jose';
import { THXOIDCUser } from '../types';

interface RequestConfig extends RequestInit {
    poolId?: string;
}

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    get(path: string, config?: RequestConfig) {
        return this.request(path, { ...config, method: 'GET' });
    }

    post(path: string, config?: RequestConfig) {
        return this.request(path, { ...config, method: 'POST' });
    }

    patch(path: string, config?: RequestConfig) {
        return this.request(path, { ...config, method: 'PATCH' });
    }

    put(path: string, config?: RequestConfig) {
        return this.request(path, { ...config, method: 'PUT' });
    }

    delete(path: string, config?: RequestConfig) {
        return this.request(path, { ...config, method: 'DELETE' });
    }

    private async request(path: string, config: RequestInit) {
        // Check for user to exist and token not to be expired
        if (!this.client.oidc.isAuthenticated) {
            await this.client.oidc.init();
        }
        // Another check to make sure init was successfull
        if (!this.client.oidc.user) {
            throw new Error('Not authenticated');
        }

        const headers = this.getHeaders(config);
        const r = await fetch(this.getUrl(path), {
            ...config,
            headers,
        });

        return await this.handleResponse(r);
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

    private getHeaders(config?: RequestConfig): HeadersInit {
        const { access_token } = this.client.oidc.user as THXOIDCUser;
        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...config?.headers,
        });

        if (access_token) {
            const token = this.validateToken(access_token);
            headers.append('Authorization', `Bearer ${token}`);
        }

        // Needs refactor
        if ((config && config.poolId) || this.client.options.poolId) {
            headers.append('X-PoolId', (config && config.poolId) || this.client.options.poolId);
        }

        return headers;
    }

    private handleResponse(r: Response) {
        if (r.status >= 400 && r.status < 600) {
            throw r.json();
        } else {
            return r.json();
        }
    }
}

export default RequestManager;
