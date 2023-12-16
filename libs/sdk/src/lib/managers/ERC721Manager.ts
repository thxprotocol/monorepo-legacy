import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(params: { chainId: string }) {
        const obj = new URLSearchParams(params);
        return await this.client.request.get(`/v1/erc721/token?${obj.toString()}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc721/token/${id}`);
    }

    async getContract(id: string) {
        return await this.client.request.get(`/v1/erc721/${id}`);
    }

    async getMetadata(erc721Id: string, metadataId: string) {
        return await this.client.request.get(`/v1/erc721/${erc721Id}/metadata/${metadataId}`);
    }

    async transfer(config: { erc721Id: string; erc721TokenId: string; to: string }) {
        return await this.client.request.post(`/v1/erc721/transfer`, { data: JSON.stringify(config) });
    }
}

export default ERC721Manager;
