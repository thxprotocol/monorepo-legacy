import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId?: string) {
        return await this.client.request.get(`/v1/rewards`, { poolId });
    }

    social = {
        claim: async (id: string) => {
            return await this.client.request.post(`/v1/rewards/points/${id}/claim`);
        },
    };

    custom = {
        claim: async (id: string) => {
            return await this.client.request.post(`/v1/rewards/milestones/claims/${id}/collect`);
        },
    };

    referral = {
        claim: async ({ uuid, sub }: { uuid: string; sub: string }) => {
            return await this.client.request.post(`/v1/rewards/referral/${uuid}/claim`, {
                body: JSON.stringify({ sub }),
            });
        },
    };

    daily = {
        claim: async (id: string) => {
            return await this.client.request.post(`/v1/rewards/daily/${id}/claim`);
        },
    };
}

export default RewardsManager;
