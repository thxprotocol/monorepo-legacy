import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class ClaimsManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    get(id: string) {
        return this.client.request.get(`/v1/claims/${id}`);
    }

    collect({ claimUuid }: { claimUuid: string }) {
        const params = new URLSearchParams();
        params.set('forceSync', 'false');

        return this.client.request.post(`/v1/claims/${claimUuid}/collect?${params.toString()}`);
    }

    postClaimCollects(id: string, forceSync = false) {
        const params = new URLSearchParams();
        params.set('forceSync', String(!!forceSync));

        return this.client.request.post(`/v1/claims/${id}/collect?${params.toString()}`);
    }
}

export default ClaimsManager;
