import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class ClaimsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/claims/${id}`);
    }

    async collect({ claimUuid, poolId }: { claimUuid: string; poolId: string }) {
        const params = new URLSearchParams();
        params.set('forceSync', 'false');

        const res = await this.client.request.post(`/v1/claims/${claimUuid}/collect?${params.toString()}`, {
            headers: { 'X-PoolId': poolId },
        });
        return res;
    }

    async postClaimCollects(id: string, forceSync = false) {
        const params = new URLSearchParams();
        params.set('forceSync', String(!!forceSync));
        return await this.client.request.post(`/v1/claims/${id}/collect?${params.toString()}`);
    }
}

export default ClaimsManager;
