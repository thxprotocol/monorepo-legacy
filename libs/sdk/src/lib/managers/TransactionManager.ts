import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class TransactionManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async read(id: string) {
        // method: 'GET',
        // url: '/transactions',
        const res = await this.client.request.get(`/v1/transactions/${id}`);
        return await res.json();
    }
}

export default TransactionManager;
