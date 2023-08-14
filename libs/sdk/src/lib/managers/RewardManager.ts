import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/perks`, { poolId });
    }

    erc20 = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/perks/erc20/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/erc20/${uuid}/redemption`);
            },
        },
    };

    erc721 = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/perks/erc721/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/erc721/${uuid}/redemption`);
            },
        },
        payment: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/erc721/${uuid}/payment`);
            },
        },
    };

    custom = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/perks/custom/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/custom/${uuid}/redemption`);
            },
        },
        payment: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/custom/${uuid}/payment`);
            },
        },
    };
}

export default RewardManager;
