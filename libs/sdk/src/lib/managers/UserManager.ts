import { UserManager as BaseUserManager } from 'oidc-client-ts';

import THXClient from '../client/Client';
import CacheManager from './CacheManager';

export default class UserManager extends CacheManager<BaseUserManager> {
  constructor(client: THXClient, user: BaseUserManager) {
    super(client, user);
  }

  async signinRedirectCallback() {
    try {
      const user = await this.cached.signinRedirectCallback();
      this.client.session.update({ user, accessToken: user.access_token });
      return user;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getUser() {
    const user = await this.cached.getUser();
    if (user) this.client.session.update({ user, accessToken: user.access_token });
    return user;
  }
}
