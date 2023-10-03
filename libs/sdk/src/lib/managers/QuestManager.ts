import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class QuestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/quests`, { poolId });
    }

    daily = {
        complete: async (id: string) => {
            return await this.client.request.post(`/v1/quests/daily/${id}/claim`);
        },
    };

    invite = {
        complete: async (uuid: string, payload: { sub: string }) => {
            return await this.client.request.post(`/v1/quests/invite/${uuid}/claim`, {
                body: JSON.stringify(payload),
            });
        },
    };

    social = {
        complete: async (id: string) => {
            return await this.client.request.post(`/v1/quests/social/${id}/claim`);
        },
    };

    custom = {
        complete: async (id: string) => {
            return await this.client.request.post(`/v1/quests/custom/claims/${id}/collect`);
        },
    };

    web3 = {
        complete: async (uuid: string, payload: { signature: string; message: string }) => {
            return await this.client.request.post(`/v1/quests/web3/${uuid}/claim`, {
                body: JSON.stringify(payload),
            });
        },
    };
}

export default QuestManager;
