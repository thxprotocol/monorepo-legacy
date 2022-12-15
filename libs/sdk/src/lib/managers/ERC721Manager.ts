import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list() {
        return await this.client.request.get('/v1/erc721/token');
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc721/token/${id}`);
    }
}

export default ERC721Manager;
