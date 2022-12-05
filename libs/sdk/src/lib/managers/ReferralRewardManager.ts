import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ReferralRewardManager extends BaseManager {
    timer!: number;

    constructor(client: THXClient) {
        super(client);

        if (this.client.session.poolId) {
            this.client.rewardsManager.list().then(({ referralRewards }) => {
                this.timer = window.setInterval(async () => {
                    if (window.location.href !== referralRewards[0].successUrl) return;

                    const sub = this.client.storeManager.getValue('ref');
                    await this.client.referralRewardClaimManager.post({ uuid: referralRewards[0]._id, sub });

                    window.clearInterval(this.timer);
                }, 500);
            });
        }
    }
}

export default ReferralRewardManager;
