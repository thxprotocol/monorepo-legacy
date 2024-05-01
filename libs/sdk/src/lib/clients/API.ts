import { THXAPIClientOptions } from '../types';
import { THXOIDCGrant } from '../managers/OIDCManager';
import RequestManager from '../managers/RequestManager';
import EventManager from '../managers/EventManager';
import IdentityManager from '../managers/IdentityManager';
import CampaignManager from '../managers/CampaignManager';
import RecaptchaManager from '../managers/RecaptchaManager';

export default class THXAPIClient {
    options: THXAPIClientOptions;
    request: RequestManager;
    identity: IdentityManager;
    events: EventManager;
    campaigns: CampaignManager;
    recaptcha: RecaptchaManager;

    constructor(options: THXAPIClientOptions) {
        this.options = options;
        this.request = new RequestManager(this, THXOIDCGrant.ClientCredentials);
        this.identity = new IdentityManager(this);
        this.events = new EventManager(this);
        this.campaigns = new CampaignManager(this);
        this.recaptcha = new RecaptchaManager(this);
    }
}
