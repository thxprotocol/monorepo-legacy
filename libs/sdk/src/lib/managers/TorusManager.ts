import { User } from 'oidc-client-ts';

import CustomAuth, { CustomAuthArgs, TorusKey } from '@toruslabs/customauth';

import { THXClient } from '../../index';
import { TORUS_VERIFIER } from '../configs';
import CacheManager from './CacheManager';

class TorusManager extends CacheManager<CustomAuth> {
  constructor(client: THXClient, args: CustomAuthArgs) {
    const torusClient = new CustomAuth(args);
    super(client, torusClient);
  }

  async getPrivateKeyForUser(user: User) {
    const torusKey: TorusKey = await this.cached.getTorusKey(
      TORUS_VERIFIER,
      user.profile.sub,
      { verifier_id: user.profile.sub },
      user.access_token
    );

    return `0x${torusKey.privateKey}`;
  }
}

export default TorusManager;
