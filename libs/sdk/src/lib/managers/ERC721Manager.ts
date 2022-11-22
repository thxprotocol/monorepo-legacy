import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list() {
        const res = await this.client.request.get(`/v1/erc721/token`);
        return await res.json();
    }

    async get(id: string) {
        const res = await this.client.request.get(`/v1/erc721/token/${id}`);
        return await res.json();
    }
}

export default ERC721Manager;
