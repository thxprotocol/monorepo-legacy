import { URL_CONFIG } from '../configs';
import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    private getUrl(path: string) {
        const env = this.client.credential.cached.env;
        return URL_CONFIG[env as string]['API_URL'] + path;
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

    async get(path: string, config?: RequestInit) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const response = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'GET',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        if (response.status === 401) {
            await this.silentSignin();
        }

        return await response.json();
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

    async post(path: string, config?: RequestInit) {
        const headers = this.getHeaders();
        const env = this.client.credential.cached.env;
        const response = await fetch(URL_CONFIG[env]['API_URL'] + path, {
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

        if (response.status === 401) {
            await this.silentSignin();
        }

        return await response.json();
    }

    async patch(path: string, config?: RequestInit) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const response = await fetch(url, {
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

        if (response.status === 401) {
            await this.silentSignin();
        }

        return await response.json();
    }

    async put(path: string, config?: RequestInit) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const response = await fetch(url, {
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

        if (response.status === 401) {
            await this.silentSignin();
        }

        return await response.json();
    }

    async delete(path: string, config?: RequestInit) {
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const response = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'DELETE',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        if (response.status === 401) {
            await this.silentSignin();
        }

        return await response.json();
    }
}

export default RequestManager;
