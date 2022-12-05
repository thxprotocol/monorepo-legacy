import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardsManager extends BaseManager {
    rewards: any[];

    constructor(client: THXClient) {
        super(client);
        this.rewards = [];
    }

    async list(poolId: string) {
        const res = await this.client.request.get(`/v1/rewards`, { headers: { 'X-PoolId': poolId } });
        const rewards = await res.json();
        this.rewards = rewards;
        return rewards;
    }
}

export default RewardsManager;
