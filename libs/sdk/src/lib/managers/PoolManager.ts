import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class PoolManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async verifyAccessByDiscordId(discordId: string, poolId: string) {
        try {
            const data = await this.client.request.get(`/v1/pools/${poolId}/discord/${discordId}/verify`);
            return data;
        } catch {
            return null;
        }
    }
}

export default PoolManager;
