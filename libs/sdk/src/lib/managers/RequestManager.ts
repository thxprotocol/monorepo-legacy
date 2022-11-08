import { URL_CONFIG } from '../configs';
import THXError from '../errors/Error';
import ErrorCode from '../errors/ErrorCode';
import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RequestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    private async getHeaders() {
        const accessToken = this.client.session.cached.accessToken;
        return { authorization: `Bearer ${accessToken}` };
    }

    private async preflight() {
        if (this.client.session.cached.user || this.client.session.cached.accessToken) return;
        throw new THXError(ErrorCode.SIGN_IN_REQUIRED);
    }

    async get(url: string, config?: RequestInit) {
        await this.preflight();
        const headers = await this.getHeaders();

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
            const name = `oidc.user:${URL_CONFIG['AUTH_URL']}:${clientId}`;
            const user = await this.client.userManager.cached.signinSilent();
            await this.client.userManager.cached.storeUser(user);
            sessionStorage.setItem(name, JSON.stringify(user));
        } else {
            await this.client.credential.clientCredential();
        }
    }

    async post(url: string, config?: RequestInit) {
        await this.preflight();
        const headers = await this.getHeaders();

        const response = await fetch(url, {
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

    async patch(url: string, config?: RequestInit) {
        await this.preflight();
        const headers = await this.getHeaders();

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

    async put(url: string, config?: RequestInit) {
        await this.preflight();
        const headers = await this.getHeaders();

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

    async delete(url: string, config?: RequestInit) {
        await this.preflight();
        const headers = await this.getHeaders();

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
