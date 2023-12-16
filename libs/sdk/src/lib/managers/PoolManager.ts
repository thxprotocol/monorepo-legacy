import { THXClient } from '../clients';
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

    subscription = {
        get: async (id: string) => {
            return await this.client.request.get(`/v1/pools/${id}/subscription`);
        },

        post: async (payload: { poolId: string; email: string }) => {
            return await this.client.request.post(`/v1/pools/${payload.poolId}/subscription`, {
                data: JSON.stringify({ email: payload.email }),
            });
        },

        delete: async (id: string) => {
            return await this.client.request.delete(`/v1/pools/${id}/subscription`);
        },
    };
}

export default PoolManager;
