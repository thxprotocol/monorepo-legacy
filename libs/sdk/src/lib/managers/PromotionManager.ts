import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class PromotionManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async filter({ poolId, page = 1, limit = 10 }: { poolId: string; page: number; limit: number }) {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));

        const res = await this.client.request.get(`/v1/promotions?${params.toString()}`, {
            headers: { 'X-PoolId': poolId },
        });
        return await res.json();
    }
}

export default PromotionManager;
