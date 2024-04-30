import RequestManager from '../managers/RequestManager';
import AccountManager from '../managers/AccountManager';
import { THXOIDCGrant } from '../managers/OIDCManager';
import { THXIdentityClientOptions } from '../types';

export default class THXIdentityClient {
    options: THXIdentityClientOptions;
    request: RequestManager;
    account: AccountManager;

    constructor(options: THXIdentityClientOptions) {
        this.options = options;
        this.request = new RequestManager(this, THXOIDCGrant.IdentityCode);
        this.account = new AccountManager(this);
    }
}
