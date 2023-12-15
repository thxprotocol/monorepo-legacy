import { THXAPIClientOptions } from '../types';
import RequestManager from '../managers/RequestManager';
import EventManager from '../managers/EventManager';
import IdentityManager from '../managers/IdentityManager';
import OIDCManager from '../managers/OIDCManager';

export default class THXAPIClient {
    options: THXAPIClientOptions;
    request: RequestManager;
    oidc: OIDCManager;
    identity: IdentityManager;
    events: EventManager;

    constructor(options: THXAPIClientOptions) {
        this.options = options;
        this.request = new RequestManager(this);
        this.oidc = new OIDCManager(this);
        this.identity = new IdentityManager(this);
        this.events = new EventManager(this);
    }
}
