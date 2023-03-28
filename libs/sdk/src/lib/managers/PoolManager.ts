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

    async isSubscribed(id: string) {
        const result = await this.client.request.get(`/v1/pools/${id}/subscription`);
        return result != null;
    }

    async subscribe(id: string) {
        return await this.client.request.post(`/v1/pools/${id}/subscription`);
    }

    async unSubscribe(id: string) {
        return await this.client.request.delete(`/v1/pools/${id}/subscription`);
    }
}

export default PoolManager;
