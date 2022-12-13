import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ReferralRewardManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/referral-rewards/${id}`);
    }
}

export default ReferralRewardManager;
