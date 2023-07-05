import * as jose from 'jose';

type THXAuthOptions = {
    clientId: string;
    clientSecret: string;
    grantType: string;
    scope: string;
    issuer: string;
};

type THXAuthUser = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
};

export default class THXOIDCClient {
    options: THXAuthOptions;
    user?: THXAuthUser;
    expiresAt: number;

    constructor(options: THXAuthOptions) {
        this.options = options;
        this.expiresAt = Date.now();
    }

    get expired() {
        return Date.now() > this.expiresAt;
    }

    async signin() {
        const authHeader =
            'Basic ' + Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`).toString('base64');
        const response = await fetch(`${this.options.issuer}/token`, {
            method: 'POST',
            mode: 'cors',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader,
            }),
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                scope: this.options.scope,
            }),
        });
        this.user = await response.json();
        if (!this.user?.expires_in) return;

        this.expiresAt = Date.now() + this.user.expires_in * 1000;
    }

    async validateToken(accessToken: string) {
        const { exp } = jose.decodeJwt(accessToken);

        if (!exp || Date.now() > exp * 1000) {
            return false;
        }

        return true;
    }
}
