import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';

class ERC20Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(chainId: ChainId) {
        return await this.client.request.get(`/v1/erc20/token?chainId=${chainId}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc20/token/${id}`);
    }

    async transferFrom(erc20: string, from: string, to: string, amount: string, chainId: ChainId) {
        const params = new URLSearchParams();
        params.append('erc20', erc20);
        params.append('from', from);
        params.append('to', to);
        params.append('amount', amount);
        params.append('chainId', chainId.toString());
        return await this.client.request.post(`/v1/erc20/transfer`, { body: params });
    }
}

export default ERC20Manager;
