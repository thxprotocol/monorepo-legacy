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
        const res = await this.client.request.get(`/v1/erc721/token/${id}`);
        return await res.json()
    }

    async getContract(id: string) {
        const res = await this.client.request.get(`/v1/erc721/${id}`);
        return await res.json();
    }

    async getMetadata(erc721Id: string, metadataId: string) {
        const res = await this.client.request.get(`/erc721/${erc721Id}/metadata/${metadataId}`);
        return await res.json();
    }
}

export default ERC721Manager;
