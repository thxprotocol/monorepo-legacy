import { URL_CONFIG } from '../configs';
import THXError from '../errors/Error';
import ErrorCode from '../errors/ErrorCode';
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
        const accessToken = this.client.session.cached.accessToken;
        return { authorization: `Bearer ${accessToken}` };
    }

    private preflight() {
        if (this.client.session.cached.user || this.client.session.cached.accessToken) return;
        throw new THXError(ErrorCode.SIGN_IN_REQUIRED);
    }

    async get(path: string, config?: RequestInit) {
        this.preflight();
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

        return response;
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
        this.preflight();
        const headers = this.getHeaders();
        const env = this.client.credential.cached.env;
        const response = await fetch(URL_CONFIG[env]['API_URL'] + path, {
            ...config,
            mode: 'cors',
            method: 'POST',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        if (response.status === 401) {
            await this.silentSignin();
        }

        return response;
    }

    async patch(path: string, config?: RequestInit) {
        this.preflight();
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const response = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'PATCH',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        if (response.status === 401) {
            await this.silentSignin();
        }

        return response;
    }

    async put(path: string, config?: RequestInit) {
        this.preflight();
        const headers = this.getHeaders();
        const url = this.getUrl(path);
        const response = await fetch(url, {
            ...config,
            mode: 'cors',
            method: 'PUT',
            credentials: 'omit',
            headers: new Headers({ ...config?.headers, ...headers }),
        });

        if (response.status === 401) {
            await this.silentSignin();
        }

        return response;
    }

    async delete(path: string, config?: RequestInit) {
        this.preflight();
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

        return response;
    }
}

export default RequestManager;
