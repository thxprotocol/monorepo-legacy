import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import * as jose from 'jose';

interface Config extends RequestInit {
    poolId?: string;
}

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(path: string, config?: Config) {
        const headers = this.getHeaders(config?.poolId);
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'GET',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        return await this.handleResponse(r);
    }

    async post(path: string, config?: Config) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'POST',
            credentials: 'omit',
            headers: new Headers({
                ...config?.headers,
                ...headers,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
        });

        return await this.handleResponse(r);
    }

    async patch(path: string, config?: Config) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'PATCH',
            credentials: 'omit',
            headers: new Headers({
                ...config?.headers,
                ...headers,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
        });

        return await this.handleResponse(r);
    }

    async put(path: string, config?: Config) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'PUT',
            credentials: 'omit',
            headers: new Headers({
                ...config?.headers,
                ...headers,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
        });

        return await this.handleResponse(r);
    }

    async delete(path: string, config?: Config) {
        const headers = await this.getHeaders();
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'DELETE',
            credentials: 'omit',
            headers: new Headers({
                ...config?.headers,
                ...headers,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
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

    private getHeaders(poolId?: string) {
        const headers: { [key: string]: string } = {};
        const { accessToken } = this.client.options;

        if (accessToken) {
            headers['Authorization'] = `Bearer ${this.validateToken(accessToken)}`;
        }

        if (poolId || this.client.options.poolId) {
            headers['X-PoolId'] = (poolId || this.client.options.poolId) as string;
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
