import { URLSearchParams } from 'url';

import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { AUTH_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '@thxnetwork/auth/config/secrets';
import { githubClient } from '../util/axios';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import TokenService from './TokenService';
import { TToken } from '@thxnetwork/common/lib/types';

export class GithubService {
    static async isAuthorized(account: AccountDocument) {
        const token = await TokenService.getToken(account, AccessTokenKind.Github);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const tokens = await this.refreshAccess(token.refreshToken);
                const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
                await TokenService.setToken(account, {
                    kind: AccessTokenKind.Github,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiry,
                });
                return true;
            } catch {
                return false;
            }
        }
        return true;
    }

    static async getMe(accessToken: string) {
        const r = await githubClient({
            url: '/user',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        return r.data;
    }

    static async refreshAccess(refreshToken: string) {
        const r = await githubClient({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                refresh_token: refreshToken,
                grant_type: 'authorization_code',
                client_secret: GITHUB_CLIENT_SECRET,
                client_id: GITHUB_CLIENT_ID,
            },
        });

        if (r.status !== 200) {
            throw new Error('Failed to request access token');
        }
        return r.data;
    }

    // https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
    static getLoginURL(
        uid: string,
        { scope = ['public_repo'], redirectUrl = AUTH_URL + '/oidc/callback/github' }: CommonOauthLoginOptions,
    ) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const body = new URLSearchParams();
        if (uid) body.append('state', state);
        body.append('allow_signup', 'true');
        body.append('client_id', GITHUB_CLIENT_ID);
        body.append('redirect_uri', redirectUrl);
        body.append('scope', scope.join(' '));

        return `https://github.com/login/oauth/authorize?${body.toString()}`;
    }

    static async getTokens(code: string) {
        const r = await githubClient({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                code,
                redirect_uri: AUTH_URL + '/oidc/callback/github',
                client_secret: GITHUB_CLIENT_SECRET,
                client_id: GITHUB_CLIENT_ID,
            },
        });

        const search = new URLSearchParams(r.data);
        const accessToken = search.get('access_token');
        const refreshToken = search.get('refresh_token');
        const user = await this.getMe(accessToken);
        const expiresIn = search.get('expires_in');
        const expiry = expiresIn && Date.now() + Number(expiresIn) * 1000;

        return {
            kind: AccessTokenKind.Github,
            accessToken,
            refreshToken,
            expiry,
            userId: user.id,
        };
    }
}

export default GithubService;
