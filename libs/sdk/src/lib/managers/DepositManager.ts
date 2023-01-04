import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class DepositManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async create({ poolId, amount, item }: { poolId: string; amount: string; item?: string }) {
        const data = await this.client.request.post('/v1/deposits', {
            headers: { 'X-PoolId': poolId },
            body: JSON.stringify({ amount, item }),
        });
        return data;
    }

    async approve({ poolId, amount }: { poolId: string; amount: string }) {
        const res = await this.client.request.post(`/v1/deposits/approve`, {
            headers: { 'X-PoolId': poolId },
            body: JSON.stringify({ amount }),
        });
        return res;
    }
}

export default DepositManager;