import { UserManager as BaseUserManager, UserManagerSettings } from 'oidc-client-ts';
import type { Credential } from '../types';
import { URL_CONFIG } from '../configs';
import CredentialManager from '../managers/CredentialManager';
import ERC20Manager from '../managers/ERC20Manager';
import ERC721Manager from '../managers/ERC721Manager';
import RequestManager from '../managers/RequestManager';
import AccountManager from '../managers/AccountManager';
import SessionManager from '../managers/SessionManager';
import UserManager from '../managers/UserManager';
import WalletManager from '../managers/WalletManager';
import ReferralRewardManager from '../managers/ReferralRewardManager';
import RewardsManager from '../managers/RewardsManager';
import StoreManager from '../managers/StoreManager';
import ReferralRewardClaimManager from '../managers/ReferralRewardClaimManager';

type Props = Omit<Credential, 'grantType'>;

export default class THXClient {
    initialized = false;
    authenticated = false;

    /* Internal managers */
    erc20: ERC20Manager;
    erc721: ERC721Manager;
    request: RequestManager;
    session: SessionManager;
    userManager: UserManager;
    credential: CredentialManager;
    walletManager: WalletManager;
    referralRewardManager: ReferralRewardManager;
    referralRewardClaimManager: ReferralRewardClaimManager;
    rewardsManager: RewardsManager;
    storeManager: StoreManager;

    /* External managers */
    account: AccountManager;

    constructor({ scopes = 'openid', ...rest }: Props) {
        const env = rest.env || 'prod';
        const settings: UserManagerSettings = {
            authority: URL_CONFIG[env]['AUTH_URL'],
            client_id: rest.clientId,
            client_secret: rest.clientSecret,
            redirect_uri: rest.redirectUrl || '',
            post_logout_redirect_uri: rest.post_logout_redirect_uri || rest.redirectUrl,
            response_type: 'code',
            revokeTokenTypes: ['refresh_token'],
            resource: URL_CONFIG[env]['API_URL'],
            automaticSilentRenew: rest.automaticSilentRenew,
            silent_redirect_uri: rest.silent_redirect_uri,
            loadUserInfo: false,
            scope: scopes,
        };

        /* Mapped values */
        const userManager = new BaseUserManager(settings);
        const grantType = rest.redirectUrl ? 'authorization_code' : 'client_credentials';

        /** Init managers */
        this.request = new RequestManager(this);
        this.credential = new CredentialManager(this, {
            ...rest,
            scopes,
            grantType,
        });
        this.userManager = new UserManager(this, userManager);
        this.session = new SessionManager(this, { poolId: rest.poolId });
        this.account = new AccountManager(this);
        this.erc20 = new ERC20Manager(this);
        this.erc721 = new ERC721Manager(this);
        this.walletManager = new WalletManager(this);
        this.rewardsManager = new RewardsManager(this);
        this.storeManager = new StoreManager(this);

        // TODO Part 1
        // Introduce and construct StorageManager
        // Read query string param `ref` value from URL
        // If any, store in sessionStorage
        this.storeManager.storeValueFromURL('ref');

        // TODO Part 2
        // Introduce URL change listener that functions well cross browser
        // See if you can find a small and good lib for this to steal code from
        // Make sure to start but also stop listening under the correct conditions (no UUID in storage for example)
        this.referralRewardManager = new ReferralRewardManager(this);
        this.referralRewardClaimManager = new ReferralRewardClaimManager(this);

        // TODO Part 3
        // Introduce and construct ReferralRewardManager
        // Provide a claim method that calls POST /referral-rewards/:uuid/claim
        // URL change listener will trigger referralReward.claim(uuid) (@Peter)
    }

    public async init() {
        if (this.initialized) return;
        const grantType = this.credential.cached.grantType;

        if (grantType === 'authorization_code') {
            return await this.credential.authorizationCode();
        } else {
            return await this.credential.clientCredential();
        }
    }

    public async signin() {
        const grantType = this.credential.cached.grantType;
        if (grantType === 'client_credentials') return;

        await this.userManager.cached.signinRedirect({
            extraQueryParams: {
                return_url: this.credential.cached.redirectUrl || '',
            },
        });
    }

    public async signout() {
        const grantType = this.credential.cached.grantType;
        if (grantType === 'client_credentials') return;

        await this.userManager.cached.signoutRedirect({});
    }
}
