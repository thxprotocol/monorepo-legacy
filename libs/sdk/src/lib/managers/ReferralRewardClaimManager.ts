import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ReferralRewardClaimManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async post({ uuid, sub }: { uuid: string; sub: string }) {
        return await this.client.request.post(`/v1/referral-rewards/${uuid}/claims`, {
            body: JSON.stringify({ sub }),
        });
    }
}

export default ReferralRewardClaimManager;
