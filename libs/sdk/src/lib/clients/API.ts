import { THXAPIClientOptions, THXOIDCUser } from '../types';
import RequestManager from '../managers/RequestManager';
import EventManager from '../managers/EventManager';
import IdentityManager from '../managers/IdentityManager';

export default class THXAPIClient {
    options: THXAPIClientOptions;
    user!: THXOIDCUser;
    expiresAt!: number;

    request: RequestManager;
    identity: IdentityManager;
    events: EventManager;

    constructor(options: THXAPIClientOptions) {
        this.options = options;

        this.request = new RequestManager(this);
        this.identity = new IdentityManager(this);
        this.events = new EventManager(this);
    }
}
