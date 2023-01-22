import { THXClient } from '../../index';

import BaseManager from './BaseManager';

export default class AccountManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get() {
        return await this.client.request.get('/v1/account', { waitForAuth: true });
    }

    async patch(body: any) {
        return await this.client.request.patch('/v1/account', { body });
    }
}
