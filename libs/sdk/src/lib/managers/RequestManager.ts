import { URL_CONFIG } from '../configs';
import { THXClient } from '../../index';
import BaseManager from './BaseManager';

interface Config extends RequestInit {
    waitForAuth?: boolean;
}

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    private waitForAuth() {
        return new Promise((resolve) => {
            const callback = () => {
                if (this.client.session.cached.accessToken) {
                    resolve(true);
                    clearInterval(interval);
                }
            };

            const interval = setInterval(callback, 100);
        });
    }

    private getUrl(path: string) {
        const env = this.client.credential.cached.env;
        return URL_CONFIG[env]['API_URL'] + path;
    }

    private getHeaders() {
        const headers: any = {};

        if (this.client.session.user?.access_token) {
            headers['Authorization'] = `Bearer ${this.client.session.user?.access_token}`;
        }
        if (this.client.session.poolId) {
            headers['X-PoolId'] = this.client.session.poolId;
        }

        return headers;
    }

    private async handleStatus(r: Response) {
        if (r.status === 401) {
            await this.silentSignin();
        }

        if (r.status >= 400 && r.status < 600) {
            throw await r.json();
        }
    }

    async silentSignin() {
        if (this.client.credential.cached.grantType === 'authorization_code') {
            const clientId = this.client.credential.cached.clientId;
            const env = this.client.credential.cached.env;
            const name = `oidc.user:${URL_CONFIG[env]['AUTH_URL']}:${clientId}`;
            const user = await this.client.userManager.cached.signinSilent();
            await this.client.userManager.cached.storeUser(user);
            sessionStorage.setItem(name, JSON.stringify(user));
        } else {
            await this.client.credential.clientCredential();
        }
    }

    async get(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = this.getHeaders();
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

        const headers = this.getHeaders();
        const env = this.client.credential.cached.env;
        const r = await fetch(URL_CONFIG[env]['API_URL'] + path, {
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

        await this.handleStatus(r);

        return await r.json();
    }

    async put(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

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

        await this.handleStatus(r);

        return await r.json();
    }

    async delete(path: string, config?: Config) {
        if (config?.waitForAuth) await this.waitForAuth();

        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const r = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'DELETE',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        await this.handleStatus(r);

        return await r.json();
    }
}

export default RequestManager;
