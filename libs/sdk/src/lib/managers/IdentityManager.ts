import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class IdentityManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async create() {
        if (!this.client.options.apiKey) {
            throw new Error(
                "Please provide an 'apiKey' when constructing the client or set it with 'client.setApiKey('...')'.",
            );
        }

        return await this.client.request.post('/v1/identity', {
            body: JSON.stringify({ apiKey: this.client.options.apiKey }),
        });
    }
}

export default IdentityManager;
