import { THXAPIClient } from '@thxnetwork/sdk/clients';
import { THX_CLIENT_ID, THX_CLIENT_SECRET } from '../config/secrets';
import AccountProxy from '../proxies/AccountProxy';

class THXService {
    thx: THXAPIClient;

    constructor() {
        if (THX_CLIENT_ID && THX_CLIENT_SECRET) {
            this.thx = new THXAPIClient({
                clientId: THX_CLIENT_ID,
                clientSecret: THX_CLIENT_SECRET,
            });
        }
    }

    async createIdentity(account: TAccount) {
        if (!this.thx || account.identity) return;
        const identity = await this.thx.identity.create();
        await AccountProxy.update(account.sub, { identity });
    }

    async createEvent(account: TAccount, event: string) {
        if (!this.thx || !account.identity) return;
        await this.thx.events.create({ identity: account.identity, event });
    }
}

const THXServiceInstance = new THXService();

export default THXServiceInstance;
