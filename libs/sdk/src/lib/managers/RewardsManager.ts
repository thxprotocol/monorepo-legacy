import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class RewardsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(poolId: string) {
        const res = await this.client.request.get(`/v1/rewards`, { headers: { 'X-PoolId': poolId } });
        return await res.json();
    }
}

export default RewardsManager;
