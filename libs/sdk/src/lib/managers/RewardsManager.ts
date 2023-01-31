import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list() {
        return await this.client.request.get(`/v1/rewards`);
    }

    points = {
        claim: async (uuid: string) => {
            return await this.client.request.post(`/v1/rewards/points/${uuid}/claim`);
        },
    };

    milestones = {
        claim: async (uuid: string) => {
            return await this.client.request.post(`/v1/rewards/milestones/claims/${uuid}/collect`);
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
        claim: async ({ uuid, sub }: { uuid: string; sub: string }) => {
            return await this.client.request.post(`/v1/rewards/daily/${uuid}/claim`, {
                body: JSON.stringify({ sub }),
            });
        },
    };
}

export default RewardsManager;
