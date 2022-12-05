import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardsManager extends BaseManager {
    rewards: any[];

    constructor(client: THXClient) {
        super(client);
        this.rewards = [];
    }

    async list() {
        return await this.client.request.get(`/v1/rewards`);
    }

    async claimPointsReward(uuid: string) {
        return await this.client.request.post(`/v1/rewards/points/${uuid}/claim`);
    }

    async claimReferralReward({ uuid, sub }: { uuid: string; sub: string }) {
        return await this.client.request.post(`/v1/rewards/referral/${uuid}/claim`, {
            body: JSON.stringify({ sub }),
        });
    }
}

export default RewardsManager;
