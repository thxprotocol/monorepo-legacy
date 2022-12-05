import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class PointRewardManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        const r = await this.client.request.get(`/v1/point-rewards/${id}`);
        return await r.json();
    }
}

export default PointRewardManager;
