import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class PoolManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/pools/${id}`);
    }

    async getLeaderboard(id: string) {
        return await this.client.request.get(`/v1/pools/${id}/analytics/leaderboard/client?platform=discord`);
    }
}

export default PoolManager;
