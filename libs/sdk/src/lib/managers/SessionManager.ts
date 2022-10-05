import THXClient from '../client/Client';
import CacheManager from './CacheManager';

import type { Session } from '../types';

export default class SessionManager extends CacheManager<Session> {
  constructor(client: THXClient, session: Session) {
    super(client, session);
  }

  async update(session: Session) {
    this._cached = { ...this._cached, ...session };
  }

  get user() {
    return this.cached.user;
  }

  get privateKey() {
    return this.cached.privateKey;
  }
}
