import { URLSearchParams } from 'url';

import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } from '../util/secrets';

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
}

