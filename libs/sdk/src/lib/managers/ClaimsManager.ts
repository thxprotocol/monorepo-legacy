import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ClaimsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        const res = await this.client.request.get(`/v1/claims/${id}`);
        return await res.json();
    }

    async getHash(id: string) {
        const res = await this.client.request.get(`/v1/claims/hash/${id}`);
        return await res.json();
    }

    async postClaimCollects(id: string, forceSync = false) {
        const params = new URLSearchParams();
        params.set('forceSync', String(!!forceSync));

        const res = await this.client.request.post(`/v1/claims/${id}/collect?${params.toString()}`);
        return await res.json();
    }
}

export default ClaimsManager;
