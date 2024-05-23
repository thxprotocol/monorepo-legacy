import RequestManager from '../managers/RequestManager';
import QuestManager from '../managers/QuestManager';
import RecaptchaManager from '../managers/RecaptchaManager';
import { THXOIDCGrant } from '../managers/OIDCManager';
import { THXIdentityClientOptions } from '../types';

export default class THXIdentityClient {
    options: THXIdentityClientOptions;
    request: RequestManager;
    quests: QuestManager;
    recaptcha: RecaptchaManager;

    constructor(options: THXIdentityClientOptions) {
        this.options = options;
        this.request = new RequestManager(this, THXOIDCGrant.IdentityCode);
        this.quests = new QuestManager(this);
        this.recaptcha = new RecaptchaManager(this);
    }

    setIdentity(identityCode: string) {
        this.options.identityCode = identityCode;
    }
}
