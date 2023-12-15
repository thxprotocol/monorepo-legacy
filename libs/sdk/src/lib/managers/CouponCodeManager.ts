import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class CouponCodeManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(params: { chainId: string }) {
        const obj = new URLSearchParams(params);
        return await this.client.request.get(`/v1/coupon-rewards/payments?${obj.toString()}`);
    }
}

export default CouponCodeManager;
