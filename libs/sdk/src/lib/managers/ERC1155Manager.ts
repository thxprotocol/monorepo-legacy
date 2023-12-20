import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class ERC1155Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(params: { chainId: string }) {
        const obj = new URLSearchParams(params);
        return await this.client.request.get(`/v1/erc1155/token?${obj.toString()}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc1155/token/${id}`);
    }

    async getContract(id: string) {
        return await this.client.request.get(`/v1/erc1155/${id}`);
    }

    async getMetadata(erc1155Id: string, metadataId: string) {
        return await this.client.request.get(`/v1/erc1155/${erc1155Id}/metadata/${metadataId}`);
    }

    async transfer(config: { erc1155Id: string; erc1155TokenId: string; to: string }) {
        return await this.client.request.post(`/v1/erc1155/transfer`, { data: JSON.stringify(config) });
    }
}

export default ERC1155Manager;
