import ERC20Manager from '../managers/ERC20Manager';
import ERC721Manager from '../managers/ERC721Manager';
import ERC1155Manager from '../managers/ERC1155Manager';
import CouponCodeManager from '../managers/CouponCodeManager';
import RequestManager from '../managers/RequestManager';
import AccountManager from '../managers/AccountManager';
import QuestManager from '../managers/QuestManager';
import RewardManager from '../managers/RewardManager';
import QRCodeManager from '../managers/QRCodeManager';
import PoolManager from '../managers/PoolManager';
import { THXOIDCGrant } from '../managers/OIDCManager';
import { THXBrowserClientOptions } from '../types';

export default class THXBrowserClient {
    options: THXBrowserClientOptions;
    request: RequestManager;
    account: AccountManager;
    erc20: ERC20Manager;
    erc721: ERC721Manager;
    erc1155: ERC1155Manager;
    couponCodes: CouponCodeManager;
    quests: QuestManager;
    rewards: RewardManager;
    qrCodes: QRCodeManager;
    pools: PoolManager;

    constructor(options: THXBrowserClientOptions) {
        this.options = options;
        this.request = new RequestManager(this, THXOIDCGrant.AuthorizationCode);
        this.account = new AccountManager(this);
        this.erc20 = new ERC20Manager(this);
        this.erc721 = new ERC721Manager(this);
        this.erc1155 = new ERC1155Manager(this);
        this.couponCodes = new CouponCodeManager(this);
        this.quests = new QuestManager(this);
        this.rewards = new RewardManager(this);
        this.qrCodes = new QRCodeManager(this);
        this.pools = new PoolManager(this);
    }

    setCampaignId(campaignId: string) {
        this.options.poolId = campaignId;
    }
}
