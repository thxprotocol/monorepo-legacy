import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class QuestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/quests`, { poolId });
    }

    daily = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/daily/${id}/claim`);
            },
        },
    };

    invite = {
        entry: {
            create: async (uuid: string, payload: { sub: string }) => {
                return await this.client.request.post(`/v1/quests/invite/${uuid}/claim`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    social = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/social/${id}/claim`);
            },
        },
    };

    custom = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/custom/claims/${id}/collect`);
            },
        },
    };

    web3 = {
        entry: {
            create: async (uuid: string, payload: { signature: string; message: string }) => {
                return await this.client.request.post(`/v1/quests/web3/${uuid}/claim`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    gitcoin = {
        entry: {
            create: async (uuid: string, payload: { signature: string; message: string }) => {
                return await this.client.request.post(`/v1/quests/gitcoin/${uuid}/entry`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };
}

export default QuestManager;
