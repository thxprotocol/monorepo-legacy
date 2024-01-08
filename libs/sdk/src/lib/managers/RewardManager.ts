import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class RewardManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/rewards`, { poolId });
    }

    coin = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/rewards/coin/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/coin/${uuid}/redemption`);
            },
        },
    };

    nft = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/rewards/nft/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/nft/${uuid}/redemption`);
            },
        },
        payment: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/nft/${uuid}/payment`);
            },
        },
    };

    custom = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/rewards/custom/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/custom/${uuid}/redemption`);
            },
        },
        payment: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/custom/${uuid}/payment`);
            },
        },
    };

    coupon = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/rewards/coupon/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/coupon/${uuid}/redemption`);
            },
        },
        payment: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/rewards/coupon/${uuid}/payment`);
            },
        },
    };
}

export default RewardManager;
