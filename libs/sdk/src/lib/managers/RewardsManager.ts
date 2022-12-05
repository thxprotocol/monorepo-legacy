import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardsManager extends BaseManager {
    rewards: any[];

    constructor(client: THXClient) {
        super(client);
        this.rewards = [];
    }

    async list() {
        const res = await this.client.request.get(`/v1/rewards`);
        return await res.json();
    }
}

export default RewardsManager;
