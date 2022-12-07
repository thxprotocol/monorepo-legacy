import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class MembershipManager extends BaseManager {
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

    async delete(id: string) {
        const res = await this.client.request.delete(`/v1/Memberships/${id}`);
        return await res.json();
    }
    async get(id: string) {
        const res = await this.client.request.get(`/v1/Memberships/${id}`);
        return await res.json();
    }
}

export default MembershipManager;
