import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import * as jose from 'jose';

interface RequestConfig extends RequestInit {
    poolId?: string;
}

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(path: string, config?: RequestConfig) {
        return await this.request(path, { ...config, method: 'GET' });
    }

    async post(path: string, config?: RequestConfig) {
        return await this.request(path, { ...config, method: 'POST' });
    }

    async patch(path: string, config?: RequestConfig) {
        return await this.request(path, { ...config, method: 'PATCH' });
    }

    async put(path: string, config?: RequestConfig) {
        return await this.request(path, { ...config, method: 'PUT' });
    }

    async delete(path: string, config?: RequestConfig) {
        return await this.request(path, { ...config, method: 'DELETE' });
    }

    private async request(path: string, config: RequestConfig) {
        const r = await fetch(this.getUrl(path), {
            ...config,
            mode: 'cors',
            credentials: 'omit',
            headers: this.getHeaders(config),
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

    private getHeaders(config?: RequestConfig) {
        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...config?.headers,
        });
        const { accessToken } = this.client.options;

        if (accessToken) {
            headers.append('Authorization', `Bearer ${this.validateToken(accessToken)}`);
        }

        if ((config && config.poolId) || this.client.options.poolId) {
            headers.append('X-PoolId', (config && config.poolId) || this.client.options.poolId);
        }

        return headers;
    }

    private async handleResponse(r: Response) {
        if (r.status >= 400 && r.status < 600) {
            throw await r.json();
        } else {
            return await r.json();
        }
    }
}

export default RequestManager;
