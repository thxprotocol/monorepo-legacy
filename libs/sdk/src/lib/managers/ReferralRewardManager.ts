import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ReferralRewardManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    list() {
        // TODO check if there is a UUID in storage
        // TODO check if there is a referral reward for the pool
        let oldLocation = window.location.href;
        function checkURLchange() {
            if (window.location.href !== oldLocation) {
                console.log('url changed!');
                oldLocation = window.location.href;
            }
        }
        window.setInterval(checkURLchange, 500);
    }
}

export default ReferralRewardManager;
