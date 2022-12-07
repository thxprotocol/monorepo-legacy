import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class WithdrawalManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async filter({
        poolId,
        page,
        limit,
        address,
        state,
    }: {
        poolId: string;
        page: number;
        address: string;
        limit: number;
        state?: number;
    }) {
        const params = new URLSearchParams();
        params.append('member', address);
        params.append('page', String(page));
        params.append('limit', String(limit));

        if (state === 0 || state === 1) {
            params.append('state', String(state));
        }

        const res = await this.client.request.get(`/v1/withdrawals/${params.toString()}`, {
            headers: { 'X-PoolId': poolId },
        });

        return await res.json();
    }

    async get({ poolId, id }: { poolId: string; id: string }) {
        const res = await this.client.request.get('/v1/withdrawals/' + id, {
            headers: { 'X-PoolId': poolId },
        });

        return await res.json();
    }

    async withdraw({ poolId, id }: { poolId: string; id: string }) {
        const res = await this.client.request.post(`/v1/withdrawals/${id}/withdraw`, {
            headers: {
                'X-PoolId': poolId,
            },
        });

        return await res.json();
    }

    async remove({ poolId, id }: { poolId: string; id: string }) {
        const res = await this.client.request.delete(`/v1/withdrawals/${id}`, {
            headers: {
                'X-PoolId': poolId,
            },
        });

        return await res.json();
    }

    async read({ poolId, id }: { poolId: string; id: string }) {
        const res = await this.client.request.get('/v1/withdrawals/' + id, {
            headers: { 'X-PoolId': poolId },
        });

        return await res.json();
    }
}

export default WithdrawalManager;
