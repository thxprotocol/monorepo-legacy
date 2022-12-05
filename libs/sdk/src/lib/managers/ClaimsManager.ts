import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ClaimsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/claims/${id}`);
    }

    async postClaimCollects(id: string, forceSync = false) {
        const params = new URLSearchParams();
        params.set('forceSync', String(!!forceSync));
        return await this.client.request.post(`/v1/claims/${id}/collect?${params.toString()}`);
    }
}

export default ClaimsManager;
