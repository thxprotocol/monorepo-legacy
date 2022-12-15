import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class PointRewardManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/point-rewards/${id}`);
    }
}

export default PointRewardManager;
