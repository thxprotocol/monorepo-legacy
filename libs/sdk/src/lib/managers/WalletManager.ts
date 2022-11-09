import { URL_CONFIG } from '../configs/index';
import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';

class WalletManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(chainId: ChainId, sub: string) {
        const res = await this.client.request.get(
            `${URL_CONFIG['API_URL']}/v1/wallets?sub=${sub}&chainId=${chainId.toString()}`,
        );
        return await res.json();
    }

    async get(id: string) {
        const res = await this.client.request.get(`${URL_CONFIG['API_URL']}/v1/wallets/${id}`);
        return await res.json();
    }

    async create(chainId: ChainId, forceSync?: boolean) {
        const account = await this.client.account.get();
        const params = new URLSearchParams();
        params.append('sub', account._id);
        params.append('chainId', chainId.toString());
        if (forceSync) params.append('forceSync', forceSync.toString());

        const res = await this.client.request.post(`${URL_CONFIG['API_URL']}/v1/wallets`, { body: params });

        return await res.json();
    }

    async getManagers(walletId: string) {
        const res = await this.client.request.get(`${URL_CONFIG['API_URL']}/v1/wallets/${walletId}/managers`);
        return await res.json();
    }

    async addManager(walletId: string, address: string) {
        const params = new URLSearchParams();
        params.append('address', address);
        const res = await this.client.request.post(`${URL_CONFIG['API_URL']}/v1/wallets/${walletId}/managers`, {
            body: params,
        });
        return await res.json();
    }

    async deleteManager(walletManagerId: string) {
        const res = await this.client.request.delete(`${URL_CONFIG['API_URL']}/v1/wallets/managers/${walletManagerId}`);
        return res.status;
    }
}

export default WalletManager;
