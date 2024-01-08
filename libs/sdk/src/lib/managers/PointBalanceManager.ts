import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class PointBalanceManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list() {
        return await this.client.request.get('/v1/point-balances');
    }
}

export default PointBalanceManager;
