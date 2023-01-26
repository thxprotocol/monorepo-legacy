import { THXClient } from '../../index';

import AccountDiscordManager from './AccountDiscordManager';
import BaseManager from './BaseManager';

export default class AccountManager extends BaseManager {
    discord: AccountDiscordManager;

    constructor(client: THXClient) {
        super(client);
        this.discord = new AccountDiscordManager(client);
    }

    async get() {
        return await this.client.request.get('/v1/account', { waitForAuth: true });
    }

    async getByDiscordId(discordId: string) {
        return await this.client.request.get(`/v1/account/discord/${discordId}`);
    }

    async patch(body: any) {
        return await this.client.request.patch('/v1/account', { body });
    }
}
