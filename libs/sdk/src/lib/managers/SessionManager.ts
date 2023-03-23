import THXClient from '../client/Client';
import CacheManager from './CacheManager';

import type { Session } from '../types';

export default class SessionManager extends CacheManager<Session> {
    constructor(client: THXClient, session: Session) {
        super(client, session);
    }

    update(session: Session) {
        this._cached = { ...this._cached, ...session };
    }

    get user() {
        return this.cached.user;
    }

    get poolId() {
        return this.cached.poolId;
    }

    get accessToken() {
        return this.cached.accessToken;
    }

    get isExpired() {
        if (!this.cached.expiry) return true;
        return Date.now() > this.cached.expiry;
    }
}
