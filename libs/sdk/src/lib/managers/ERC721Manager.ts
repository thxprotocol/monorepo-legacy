import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(params: { chainId: string }) {
        const obj = new URLSearchParams(params);
        const res = await this.client.request.get(`/v1/erc721/token?${obj.toString()}`);
        return await res.json();
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc721/token/${id}`);
    }
}

export default ERC721Manager;
