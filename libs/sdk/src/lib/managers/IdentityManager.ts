import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class IdentityManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async create() {
        return await this.client.request.post('/v1/identity');
    }

    async get() {
        return await this.client.request.post('/v1/identity');
    }
}

export default IdentityManager;
