import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class SwapManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async create({
        poolId,
        swapRuleId,
        amountInInWei,
        tokenInAddress,
    }: {
        poolId: string;
        swapRuleId: string;
        amountInInWei: string;
        tokenInAddress: string;
    }) {
        const body = { swapRuleId, amountIn: amountInInWei, tokenInAddress };

        const res = await this.client.request.post(`/v1/swaps`, {
            headers: { 'X-PoolId': poolId },
            body: JSON.stringify(body),
        });
        return await res.json();
    }
}

export default SwapManager;
