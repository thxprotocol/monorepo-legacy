import { THXClient } from '../clients';

export default class BaseManager {
    client!: THXClient;

    constructor(client: THXClient) {
        this.client = client;
    }
}
