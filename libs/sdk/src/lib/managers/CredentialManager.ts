import THXClient from '../client/Client';
import CacheManager from './CacheManager';
import TorusManager from './TorusManager';
import { URL_CONFIG } from '../configs/index';

import type { Credential } from '../types';

export default class CredentialManager extends CacheManager<Credential> {
  constructor(client: THXClient, credential: Credential) {
    super(client, credential);

    this.client.torusManager = new TorusManager(client, {
      baseUrl: `${location.origin}/serviceworker`,
      network: credential.torusNetwork,
      enableLogging: false,
    });
  }

  public async authorizationCode() {
    const isRedirectBack = window.location.search.includes('code');

    if (isRedirectBack) {
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
      const toEncodeParam = `${this.cached.clientId}:${this.cached.clientSecret}`;
      const encodedParam = Buffer.from(toEncodeParam).toString('base64');
      const code = 'Basic ' + encodedParam;

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('scope', this.cached.scopes || '');

      const res = await fetch(`${URL_CONFIG['AUTH_URL']}/token`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: code,
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
