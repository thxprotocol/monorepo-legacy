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
                return await this.client.request.post(`/v1/quests/daily/${id}/entries`);
            },
        },
    };

    invite = {
        entry: {
            create: async (id: string, payload: { sub: string }) => {
                return await this.client.request.post(`/v1/quests/invite/${id}/entries`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    social = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/social/${id}/entries`);
            },
        },
    };

    custom = {
        entry: {
            create: async (id: string) => {
                return await this.client.request.post(`/v1/quests/custom/${id}/entries`);
            },
        },
    };

    web3 = {
        entry: {
            create: async (id: string, payload: { signature: string; message: string }) => {
                return await this.client.request.post(`/v1/quests/web3/${id}/entries`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };

    gitcoin = {
        entry: {
            create: async (id: string, payload: { signature: string; message: string }) => {
                return await this.client.request.post(`/v1/quests/gitcoin/${id}/entries`, {
                    data: JSON.stringify(payload),
                });
            },
        },
    };
}

export default QuestManager;
