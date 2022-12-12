import { THXClient } from '../../index';
import { ChainId } from '../types/enums/ChainId';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(chainId: ChainId) {
        return await this.client.request.get(`/v1/erc721/token?chainId=${chainId}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc721/token/${id}`);
    }
}

export default ERC721Manager;
