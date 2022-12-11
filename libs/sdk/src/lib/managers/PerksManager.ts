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
        redeem: async (uuid: string) => {
            return await this.client.request.post(`/v1/perks/erc20/${uuid}/redeem`);
        },
    };

    erc2721 = {
        get: async (uuid: string) => {
            return await this.client.request.get(`/v1/perks/erc2721/${uuid}`);
        },
        redeem: async (uuid: string) => {
            return await this.client.request.post(`/v1/perks/erc721/${uuid}/redeem`);
        },
    };
}

export default PerksManager;
