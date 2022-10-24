import { URLSearchParams } from 'url';

import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI } from '@thxnetwork/auth/config/secrets';
import { githubClient } from '../util/axios';

export const GITHUB_API_SCOPE = ['public_repo']; // https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps

export class GithubService {
    static getLoginURL(
        state: string,
        { scope = GITHUB_API_SCOPE, redirectUrl = GITHUB_REDIRECT_URI }: CommonOauthLoginOptions,
    ) {
        const body = new URLSearchParams();
        if (state) body.append('state', state);
        body.append('allow_signup', 'true');
        body.append('client_id', GITHUB_CLIENT_ID);
        body.append('redirect_uri', redirectUrl);
        body.append('scope', scope.join(' '));

        return `https://github.com/login/oauth/authorize?${body.toString()}`;
    }

    static async requestTokens(code: string) {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('redirect_uri', GITHUB_REDIRECT_URI);
        body.append('client_secret', GITHUB_CLIENT_SECRET);
        body.append('client_id', GITHUB_CLIENT_ID);

        const r = await githubClient({
            url: '/login/oauth/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });

        if (r.status !== 200) {
            throw new Error('Failed to request access token');
        }
        return r.data;
    }

    static async getUser(accessToken: string) {
        const r = await githubClient({
            url: 'https://api.github.com/user',
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        if (r.status !== 200) {
            throw new Error('Failed to fetch user information');
        }

        return r.data;
    }
}
