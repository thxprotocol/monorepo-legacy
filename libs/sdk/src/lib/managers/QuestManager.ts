import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class QuestManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/rewards`, { poolId });
    }

    daily = {
        complete: async (id: string) => {
            return await this.client.request.post(`/v1/rewards/daily/${id}/claim`);
        },
    };

    invite = {
        complete: async (uuid: string, payload: { sub: string }) => {
            return await this.client.request.post(`/v1/rewards/referral/${uuid}/claim`, {
                body: JSON.stringify(payload),
            });
        },
    };

    social = {
        complete: async (id: string) => {
            return await this.client.request.post(`/v1/rewards/points/${id}/claim`);
        },
    };

    custom = {
        complete: async (id: string) => {
            return await this.client.request.post(`/v1/rewards/milestones/claims/${id}/collect`);
        },
    };

    web3 = {
        complete: async (uuid: string, payload: { signature: string; message: string }) => {
            return await this.client.request.post(`/v1/rewards/web3/${uuid}/claim`, {
                body: JSON.stringify(payload),
            });
        },
    };
}

export default QuestManager;
