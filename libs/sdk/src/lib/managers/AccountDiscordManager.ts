import { URLSearchParams } from 'url';
import { THXClient } from '../client';
import BaseManager from './BaseManager';

export default class AccountManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async pointBalance(sub: string, poolId: string) {
        return await this.client.request.get(`/v1/account/${sub}/discord/point_balance`, {
            headers: {
                'X-PoolId': poolId,
            },
        });
    }

    async erc20Tokens(sub: string, params: any = {}) {
        const urlParams = new URLSearchParams(params);
        return await this.client.request.get(`/v1/account/${sub}/discord/erc20/token${urlParams.toString()}`);
    }

    async erc721Tokens(sub: string, params: any = {}) {
        const urlParams = new URLSearchParams(params);
        return await this.client.request.get(`/v1/account/${sub}/discord/erc721/token${urlParams.toString()}`);
    }
}
