import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class PaymentManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list({ chainId }: { chainId: string }) {
        // method: 'GET',
        // url: '/memberships',
        const params = new URLSearchParams({ chainId });
        const res = await this.client.request.get(`/v1/Memberships?${params.toString()}`);
        return await res.json();
    }

    async read(payload: { accessToken: string; paymentId: string }) {
        const res = await this.client.request.get(`/v1/payments/${payload.paymentId}`, {
            headers: { 'X-Payment-Token': payload.accessToken },
        });
        return await res.json();
    }

    async pay(payload: { id: string; poolId: string; token: string }) {
        const res = await this.client.request.post(`/v1/payments/${payload.id}/pay`, {
            headers: {
                'X-PoolId': payload.poolId,
                'X-Payment-Token': payload.token,
            },
        });

        return await res.json();
    }
}

export default PaymentManager;
