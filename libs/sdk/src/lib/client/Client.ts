import { User, UserManager as BaseUserManager, UserManagerSettings } from 'oidc-client-ts';

import { URL_CONFIG } from '../configs';
import TorusManager from '../managers/TorusManager';
import CredentialManager from '../managers/CredentialManager';
import ERC20Manager from '../managers/ERC20Manager';
import ERC721Manager from '../managers/ERC721Manager';
import RequestManager from '../managers/RequestManager';
import AccountManager from '../managers/AccountManager';
import SessionManager from '../managers/SessionManager';
import UserManager from '../managers/UserManager';

import type { Credential } from '../types';
export default class THXClient {
  initialized = false;
  authenticated = false;

  /* Internal managers */
  erc20: ERC20Manager;
  erc721: ERC721Manager;
  request: RequestManager;
  session: SessionManager;
  userManager: UserManager;
  credential: CredentialManager;
  torusManager: TorusManager = null!;

  /* External managers */
  account: AccountManager;

  constructor({ scopes = 'openid', torusNetwork = 'testnet', ...rest }: Credential) {
    const settings: UserManagerSettings = {
      authority: URL_CONFIG['AUTH_URL'],
      client_id: rest.clientId,
      client_secret: rest.clientSecret,
      redirect_uri: rest.redirectUrl!,
      response_type: 'code',
      revokeTokenTypes: ['refresh_token'],
      resource: URL_CONFIG['API_URL'],
      automaticSilentRenew: false,
      loadUserInfo: false,
      scope: scopes,
    };

    /* Mapped values */
    const userManager = new BaseUserManager(settings);

    /** Init managers */
    this.request = new RequestManager(this);
    this.credential = new CredentialManager(this, { ...rest, scopes, torusNetwork });
    this.userManager = new UserManager(this, userManager);
    this.session = new SessionManager(this, {});
    this.account = new AccountManager(this);
    this.erc20 = new ERC20Manager(this);
    this.erc721 = new ERC721Manager(this);
  }

  public async syncPrivateKey(user: User) {
    try {
      const privateKey = await this.torusManager.getPrivateKeyForUser(user);
      this.session.update({ privateKey });
    } catch (e) {
      console.error(e);
    }
  }

  public async init() {
    if (this.initialized) return;
    const grantType = this.credential.cached.grantType;

    if (grantType === 'authorization_code') {
      return await this.credential.authorizationCode();
    } else {
      return await this.credential.clientCredential();
    }
  }

  public async signin() {
    const grantType = this.credential.cached.grantType;
    if (grantType === 'client_credentials') return;

    await this.userManager.cached.signinRedirect({
      extraQueryParams: {
        return_url: this.credential.cached.redirectUrl!,
      },
    });
  }

  public async signout() {
    const grantType = this.credential.cached.grantType;
    if (grantType === 'client_credentials') return;

    await this.userManager.cached.signoutRedirect({});
  }
}
