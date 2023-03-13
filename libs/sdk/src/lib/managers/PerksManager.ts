import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class PerksManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list() {
        return await this.client.request.get(`/v1/perks`);
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

    shopify = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/perks/shopify/${uuid}`);
        },
        redemption: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/shopify/${uuid}/redemption`);
            },
        },
        payment: {
            post: async (uuid: string) => {
                return await this.client.request.post(`/v1/perks/shopify/${uuid}/payment`);
            },
        },
        discountCodes: async () => {
            return await this.client.request.get(`/v1/perks/shopify/discount-codes`);
        },
    };
}

export default PerksManager;
