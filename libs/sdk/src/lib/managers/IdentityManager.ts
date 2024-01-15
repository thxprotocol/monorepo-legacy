import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class IdentityManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    create() {
        return this.client.request.post('/v1/identity');
    }

    get(salt: string) {
        return this.client.request.get(`/v1/identity/${salt}`);
    }
}

export default IdentityManager;
