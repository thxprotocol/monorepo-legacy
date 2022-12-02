import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class DepositManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async approve({ poolId, amount }: { poolId: string; amount: string }) {
        const res = await this.client.request.post(`/v1/deposits/approve`, {
            headers: { 'X-PoolId': poolId },
            body: JSON.stringify({ amount }),
        });
        return await res.json();
    }
}

export default DepositManager;
