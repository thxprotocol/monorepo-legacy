import THXClient from '../client/Client';
import { URL_CONFIG } from '../configs/index';
import CacheManager from './CacheManager';
import { Buffer } from 'buffer';
import type { Credential } from '../types';
export default class CredentialManager extends CacheManager<Credential> {
    constructor(client: THXClient, credential: Credential) {
        super(client, credential);
    }

    public async authorizationCode() {
        const payload: any = new URLSearchParams(window.location.search);
        const isRedirectBack =
            payload['code'] ||
            payload['signup_token'] ||
            payload['password_reset_token'] ||
            payload['verifyEmailToken'];

        if (isRedirectBack) {
            const extraQueryParams: any = {
                return_url: window.location.origin,
            };

            if (payload['signup_token']) {
                extraQueryParams['prompt'] = 'confirm';
                extraQueryParams['signup_token'] = payload['signup_token'];
            }

            if (payload['password_reset_token']) {
                extraQueryParams['prompt'] = 'reset';
                extraQueryParams['password_reset_token'] = payload['password_reset_token'];
            }

            if (payload['verifyEmailToken']) {
                extraQueryParams['prompt'] = 'verify_email';
                extraQueryParams['verifyEmailToken'] = payload['verifyEmailToken'];
            }

            if (extraQueryParams['prompt']) {
                await this.client.userManager.cached.clearStaleState();

                return await this.client.userManager.cached.signinRedirect({
                    extraQueryParams,
                });
            }

            const user = await this.client.userManager.signinRedirectCallback();

            if (window.history) {
                window.history.pushState({}, document.title, window.location.pathname);
            }
            if (user) this.client.authenticated = true;
        } else {
            const user = await this.client.userManager.getUser();
            if (user) this.client.authenticated = true;
        }

        this.client.initialized = true;
        return this.client.authenticated;
    }

    public async clientCredential() {
        try {
            const env = this.client.credential.cached.env;
            const toEncodeParam = `${this.cached.clientId}:${this.cached.clientSecret}`;
            const encodedParam = Buffer.from(toEncodeParam).toString('base64');
            const code = 'Basic ' + encodedParam;

            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('scope', this.cached.scopes || '');

            const res = await fetch(`${URL_CONFIG[env]['AUTH_URL']}/token`, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': code,
                }),
                body: params,
            });
            const data = await res.json();

            this.client.session.update({ accessToken: data['access_token'] });

            return true;
        } catch {
            return false;
        }
    }
}
