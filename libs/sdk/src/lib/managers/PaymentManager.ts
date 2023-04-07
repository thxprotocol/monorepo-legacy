import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class PaymentManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list({ chainId }: { chainId: string }) {
        const params = new URLSearchParams({ chainId });
        return await this.client.request.get(`/v1/memberships?${params.toString()}`);
    }

    async read(payload: { accessToken: string; paymentId: string }) {
        const res = await this.client.request.get(`/v1/payments/${payload.paymentId}`, {
            headers: { 'X-Payment-Token': payload.accessToken },
        });
        return res;
    }

    async pay(payload: { id: string; poolId: string; token: string }) {
        const res = await this.client.request.post(`/v1/payments/${payload.id}/pay`, {
            headers: {
                'X-PoolId': payload.poolId,
                'X-Payment-Token': payload.token,
            },
        });

        return res;
    }
}

export default PaymentManager;
