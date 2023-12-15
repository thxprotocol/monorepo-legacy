import { THXClient } from '../clients';

export default class BaseManager {
    client!: THXClient;

    constructor(client: THXClient) {
        Object.defineProperty(this, 'client', { value: client });
    }
}
