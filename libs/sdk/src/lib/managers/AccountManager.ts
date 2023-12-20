import { THXClient } from '../clients';
import { ChainId } from '../types/enums/ChainId';
import BaseManager from './BaseManager';

export default class AccountManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(chainId?: ChainId) {
        return await this.client.request.get('/v1/account' + chainId && `?chainId=${chainId}`);
    }

    async patch(body: any) {
        return await this.client.request.patch('/v1/account', { data: JSON.stringify(body) });
    }

    wallet = {
        list: async (chainId: number) => {
            return await this.client.request.post(`/v1/account/wallet?chainId=${chainId}`);
        },
        connect: async (body: { chainId: number }) => {
            return await this.client.request.post(`/v1/account/wallet/connect`, { data: JSON.stringify(body) });
        },
        confirm: async (body: { chainId: number }) => {
            return await this.client.request.post(`/v1/account/wallet/confirm`, { data: JSON.stringify(body) });
        },
    };
}
