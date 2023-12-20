import { THXClient } from '../clients';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';

class ERC20Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(props: { chainId: string }) {
        const params = new URLSearchParams(props);
        return await this.client.request.get(`/v1/erc20/token?${params.toString()}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc20/token/${id}`);
    }

    async getContract(id: string) {
        return await this.client.request.get(`/v1/erc20/${id}`);
    }

    async transfer(config: { erc20Id: string; to: string; amount: string; chainId: ChainId }) {
        return await this.client.request.post(`/v1/erc20/transfer`, { data: JSON.stringify(config) });
    }
}

export default ERC20Manager;
