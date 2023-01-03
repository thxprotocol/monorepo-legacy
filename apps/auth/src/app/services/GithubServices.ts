import { URLSearchParams } from 'url';

import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI } from '@thxnetwork/auth/config/secrets';
import { githubClient } from '../util/axios';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '../types/enums/AccessTokenKind';

export const GITHUB_API_SCOPE = ['public_repo']; // https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps

export class GithubService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Github);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const tokens = await this.refreshAccess(token.refreshToken);
                const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
                account.setToken({
                    kind: AccessTokenKind.Github,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiry,
                });
                await account.save();
                return true;
            } catch {
                return false;
            }
        }
        return true;
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
        const r = await githubClient({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                code,
                redirect_uri: GITHUB_REDIRECT_URI,
                client_secret: GITHUB_CLIENT_SECRET,
                client_id: GITHUB_CLIENT_ID,
            },
        });

        if (r.status !== 200) {
            throw new Error('Failed to request access token');
        }
        return JSON.parse('{"' + decodeURI(r.data.replace(/&/g, '","').replace(/=/g, '":"')) + '"}');
    }

    static async getUser(accessToken: string) {
        const r = await githubClient({
            url: '/user',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        if (r.status !== 200) {
            throw new Error('Failed to fetch user information');
        }

        return r.data;
    }

    static async validateRepoStarted(repo: string, accessToken: string) {
        // https://docs.github.com/en/rest/activity/starring
        const r = await githubClient({
            url: `/user/starred/${repo}`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        return r.status === 204;
    }

    static async validatePRApproved(repo: string, pr: number, accessToken: string) {
        // https://docs.github.com/en/rest/pulls/reviews
        const r = await githubClient({
            url: `/repos/${repo}/pulls/${pr}/reviews`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        return r.data.state === 'APPROVED';
    }

    static async validateIssueCreated(repo: string, accessToken: string) {
        const userinfo = await this.getUser(accessToken);
        // https://docs.github.com/en/rest/issues/issues

        const r = await githubClient({
            url: `/repos/${repo}/issues`,
            method: 'GET',
            params: {
                creator: userinfo.login,
            },
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        return r.status === 200;
    }

    static async validateIssueCommented(repo: string, issue: string, accessToken: string) {
        // https://docs.github.com/en/rest/issues/issues

        const r = await githubClient({
            url: `/repos/${repo}/issues/${issue}/comments`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        return r.status === 200;
    }
}

export default GithubService;
