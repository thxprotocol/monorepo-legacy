import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class IdentityManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    create() {
        return this.client.request.post('/v1/identity');
    }

    get(uuid: string) {
        return this.client.request.get(`/v1/identity/${uuid}`);
    }
}

export default IdentityManager;
