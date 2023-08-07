import { THXClient } from '../../index';
import { ChainId } from '../types/enums/ChainId';
import AccountDiscordManager from './AccountDiscordManager';

import BaseManager from './BaseManager';

export default class AccountManager extends BaseManager {
    discord: AccountDiscordManager;

    constructor(client: THXClient) {
        super(client);
        this.discord = new AccountDiscordManager(client);
    }

    async get(chainId?: ChainId) {
        return await this.client.request.get('/v1/account' + chainId && `?chainId=${chainId}`);
    }

    async getByDiscordId(discordId: string) {
        return await this.client.request.get(`/v1/account/discord/${discordId}`);
    }

    async patch(body: any) {
        return await this.client.request.patch('/v1/account', { body: JSON.stringify(body) });
    }

    wallet = {
        list: async (chainId: number) => {
            return await this.client.request.post(`/v1/account/wallet?chainId=${chainId}`);
        },
        connect: async (body: { chainId: number }) => {
            return await this.client.request.post(`/v1/account/wallet/upgrade`, { body: JSON.stringify(body) });
        },
        upgrade: async (body: { chainId: number }) => {
            return await this.client.request.post(`/v1/account/wallet/upgrade`, { body: JSON.stringify(body) });
        },
        confirm: async (body: { chainId: number }) => {
            return await this.client.request.post(`/v1/account/wallet/confirm`, { body: JSON.stringify(body) });
        },
    };
}
