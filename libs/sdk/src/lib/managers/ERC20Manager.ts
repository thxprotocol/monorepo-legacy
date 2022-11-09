import { URL_CONFIG } from '../configs/index';
import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';

class ERC20Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list() {
        const res = await this.client.request.get(`${URL_CONFIG['API_URL']}/v1/erc20/token`);
        return await res.json();
    }

    async get(id: string) {
        const res = await this.client.request.get(`${URL_CONFIG['API_URL']}/v1/erc20/token/${id}`);
        return await res.json();
    }

    async transferFrom(erc20: string, from: string, to: string, amount: string, chainId: ChainId) {
        const params = new URLSearchParams();
        params.append('erc20', erc20);
        params.append('from', from);
        params.append('to', to);
        params.append('amount', amount);
        params.append('chainId', chainId.toString());
        const res = await this.client.request.post(`${URL_CONFIG['API_URL']}/v1/erc20/transfer`, { body: params });

        return await res.json();
    }
}

export default ERC20Manager;
