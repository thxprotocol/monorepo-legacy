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
        const res = await this.client.request.get(`/v1/memberships?${params.toString()}`, { waitForAuth: true }) ;
        return res
    }

    async delete(id: string) {
        const res = await this.client.request.delete(`/v1/memberships/${id}`);
        return res
    }
    async get(id: string) {
        const res = await this.client.request.get(`/v1/memberships/${id}`);
        return res
    }
}

export default MembershipManager;