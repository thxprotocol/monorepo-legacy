import ERC20Manager from '../managers/ERC20Manager';
import ERC721Manager from '../managers/ERC721Manager';
import ERC1155Manager from '../managers/ERC1155Manager';
import CouponCodeManager from '../managers/CouponCodeManager';
import RequestManager from '../managers/RequestManager';
import AccountManager from '../managers/AccountManager';
import QuestManager from '../managers/QuestManager';
import RewardManager from '../managers/RewardManager';
import ClaimsManager from '../managers/ClaimsManager';
import PoolManager from '../managers/PoolManager';
import EventManager from '../managers/EventManager';
import PointBalanceManager from '../managers/PointBalanceManager';
import IdentityManager from '../managers/IdentityManager';

type THXClientOptions = {
    url: string;
    poolId: string;
    apiKey: string;
    accessToken: string;
};

export default class THXClient {
    options: THXClientOptions;

    request: RequestManager;
    account: AccountManager;
    erc20: ERC20Manager;
    erc721: ERC721Manager;
    erc1155: ERC1155Manager;
    couponCodes: CouponCodeManager;
    quests: QuestManager;
    rewards: RewardManager;
    claims: ClaimsManager;
    pools: PoolManager;
    pointBalance: PointBalanceManager;
    events: EventManager;
    identity: IdentityManager;

    constructor(options: THXClientOptions) {
        this.options = options;

        this.request = new RequestManager(this);

        // Authorization Code Grant
        this.account = new AccountManager(this);
        this.erc20 = new ERC20Manager(this);
        this.erc721 = new ERC721Manager(this);
        this.erc1155 = new ERC1155Manager(this);
        this.couponCodes = new CouponCodeManager(this);
        this.quests = new QuestManager(this);
        this.rewards = new RewardManager(this);
        this.claims = new ClaimsManager(this);
        this.pools = new PoolManager(this);
        this.pointBalance = new PointBalanceManager(this);

        // API Key
        this.identity = new IdentityManager(this);
        this.events = new EventManager(this);
    }

    setApiKey(key: string) {
        this.options.apiKey = key;
    }

    setAccessToken(accessToken: string) {
        this.options.accessToken = accessToken;
    }

    setPoolId(poolId: string) {
        this.options.poolId = poolId;
    }
}
