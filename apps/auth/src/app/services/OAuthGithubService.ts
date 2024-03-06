import { URLSearchParams } from 'url';
import { AUTH_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '@thxnetwork/auth/config/secrets';
import { githubClient } from '../util/axios';
import { AccessTokenKind, OAuthGithubScope } from '@thxnetwork/common/enums/AccessTokenKind';
import { IOAuthService } from './interfaces/IOAuthService';
import { TokenDocument } from '../models/Token';

export default class GithubService implements IOAuthService {
    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthGithubScope[] }) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const url = new URL('https://github.com/login/oauth/authorize');
        url.searchParams.append('state', state);
        url.searchParams.append('allow_signup', 'true');
        url.searchParams.append('client_id', GITHUB_CLIENT_ID);
        url.searchParams.append('redirect_uri', AUTH_URL + '/oidc/callback/github');
        url.searchParams.append('scope', scopes.join(' '));

        return url.toString();
    }

    async requestToken(code: string) {
        const { data } = await githubClient({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                code,
                redirect_uri: AUTH_URL + '/oidc/callback/github',
                client_secret: GITHUB_CLIENT_SECRET,
                client_id: GITHUB_CLIENT_ID,
            },
        });

        const search = new URLSearchParams(data);
        const accessToken = search.get('access_token');
        const refreshToken = search.get('refresh_token');
        const expiresIn = search.get('expires_in');
        const expiry = expiresIn && Date.now() + Number(expiresIn) * 1000;
        const user = await this.getUser(accessToken);

        return {
            kind: AccessTokenKind.Github,
            accessToken,
            refreshToken,
            expiry,
            userId: user.id,
        };
    }

    async refreshToken(token: TokenDocument) {
        const { data } = await githubClient({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                refresh_token: token.refreshToken,
                grant_type: 'authorization_code',
                client_secret: GITHUB_CLIENT_SECRET,
                client_id: GITHUB_CLIENT_ID,
            },
        });
        return data;
    }

    revokeToken(token: TokenDocument): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private async getUser(accessToken: string) {
        const { data } = await githubClient({
            url: '/user',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });
        return data;
    }
}
