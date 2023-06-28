import { THXClient } from '../../index';
import BaseManager from './BaseManager';

interface Config extends RequestInit {
    waitForAuth?: boolean;
    poolId?: string;
}

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    private waitForAuth() {
        return new Promise((resolve) => {
            const callback = () => {
                if (this.client.options.accessToken) {
                    resolve(true);
                    clearInterval(interval);
                }
            };

            const interval = setInterval(callback, 100);
        });
    }

    private getUrl(path: string) {
        return this.client.options.url + path;
    }

    private async getHeaders(poolId?: string) {
        const headers: { [key: string]: string } = {};
        // if (!this.client.session.isExpired) await this.silentSignin();

        const token = this.client.options.accessToken;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (poolId || this.client.options.poolId) {
            headers['X-PoolId'] = (poolId || this.client.options.poolId) as string;
        }

        return headers;
    }

    private async handleStatus(r: Response) {
        // if (r.status === 401) {
        //     await this.silentSignin();
        // }

        if (r.status >= 400 && r.status < 600) {
            throw await r.json();
        }
    }

    // async silentSignin() {
    //     if (this.client.credential.cached.grantType === 'authorization_code') {
    //         const clientId = this.client.credential.cached.clientId;
    //         const env = this.client.credential.cached.env;
    //         const name = `oidc.user:${URL_CONFIG[env]['AUTH_URL']}:${clientId}`;
    //         const user = await this.client.userManager.cached.signinSilent();
    //         await this.client.userManager.cached.storeUser(user);
    //         sessionStorage.setItem(name, JSON.stringify(user));
    //     } else {
    //         await this.client.credential.clientCredential();
    //     }
    // }

    async get(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = await this.getHeaders(config?.poolId);
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'GET',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        await this.handleStatus(r);

        return await r.json();
    }

    async post(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = await this.getHeaders();
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

        await this.handleStatus(r);

        return await r.json();
    }

    async patch(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = await this.getHeaders();
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

        await this.handleStatus(r);

        return await r.json();
    }

    async put(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = await this.getHeaders();
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

        await this.handleStatus(r);

        return await r.json();
    }

    async delete(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = await this.getHeaders();
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'DELETE',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        return await this.handleStatus(r);
    }
}

export default RequestManager;
