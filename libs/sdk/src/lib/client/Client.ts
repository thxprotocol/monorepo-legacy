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
import PointRewardManager from '../managers/PointRewardManager';
import PerksManager from '../managers/PerksManager';
import PointBalanceManager from '../managers/PointBalanceManager';
import DepositManager from '../managers/DepositManager';
import MembershipManager from '../managers/MembershipManager';
import PaymentManager from '../managers/PaymentManager';
import ClaimsManager from '../managers/ClaimsManager';

type Props = Omit<Credential, 'grantType'>;

export default class THXClient {
    initialized = false;
    authenticated = false;
    erc20: ERC20Manager;
    erc721: ERC721Manager;
    request: RequestManager;
    session: SessionManager;
    userManager: UserManager;
    deposit: DepositManager;
    claims: ClaimsManager;
    credential: CredentialManager;
    walletManager: WalletManager;
    referralRewardManager: ReferralRewardManager;
    pointRewardManager: PointRewardManager;
    rewardsManager: RewardsManager;
    perksManager: PerksManager;
    memberships: MembershipManager;
    payments: PaymentManager;
    /* External managers */
    account: AccountManager;
    pointBalanceManager: PointBalanceManager;

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
        this.perksManager = new PerksManager(this);
        this.referralRewardManager = new ReferralRewardManager(this);
        this.pointRewardManager = new PointRewardManager(this);
        this.pointBalanceManager = new PointBalanceManager(this);
        this.deposit = new DepositManager(this);
        this.claims = new ClaimsManager(this);
        this.memberships = new MembershipManager(this);
        this.payments = new PaymentManager(this);
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
