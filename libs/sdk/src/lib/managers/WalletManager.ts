import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';

class WalletManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(chainId: ChainId, sub: string) {
        return await this.client.request.get(`/v1/wallets?sub=${sub}&chainId=${chainId.toString()}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/wallets/${id}`);
    }

    async create(chainId: ChainId, forceSync?: boolean) {
        const account = await this.client.account.get();
        const params = new URLSearchParams();
        params.append('sub', account._id);
        params.append('chainId', chainId.toString());
        if (forceSync) params.append('forceSync', forceSync.toString());

        return await this.client.request.post(`/v1/wallets`, { body: params });
    }

    async update(walletId: string, update: { code: string }) {
        return await this.client.request.patch(`/v1/wallets/${walletId}`, { body: JSON.stringify(update) });
    }

    async upgrade(walletId: string) {
        return await this.client.request.post(`/v1/wallets/${walletId}/upgrade`);
    }

    async getManagers(walletId: string) {
        return await this.client.request.get(`/v1/wallets/${walletId}/managers`);
    }

    async addManager(walletId: string, address: string) {
        const params = new URLSearchParams();
        params.append('address', address);
        return await this.client.request.post(`/v1/wallets/${walletId}/managers`, {
            body: params,
        });
    }

    async deleteManager(walletManagerId: string) {
        return await this.client.request.delete(`/v1/wallets/managers/${walletManagerId}`);
    }
}

export default WalletManager;
