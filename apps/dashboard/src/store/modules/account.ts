import type { TAccount } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, RewardConditionPlatform, AccountPlanType } from '@thxnetwork/types/enums';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { SigninRedirectArgs, User, UserManager } from 'oidc-client-ts';
import { config } from '@thxnetwork/dashboard/utils/oidc';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import Mixpanel, { track } from '@thxnetwork/mixpanel';

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    artifacts = '';
    version = '';
    _user!: User;
    _profile: TAccount | null = null;

    get user() {
        return this._user;
    }

    get profile() {
        return this._profile;
    }

    @Mutation
    setUser(user: User) {
        this._user = user;
    }

    @Mutation
    setAccount(profile: TAccount) {
        this._profile = profile;
    }

    @Mutation
    setHealth(data: { version: string; artifacts: string }) {
        this.version = data.version;
        this.artifacts = data.artifacts;
    }

    @Action({ rawError: true })
    async getGuilds() {
        const { data } = await axios({
            method: 'GET',
            url: '/account/discord',
        });
        return data.guilds;
    }

    @Action({ rawError: true })
    async getUser() {
        try {
            const user = await this.userManager.getUser();

            this.context.commit('setUser', user);

            return user;
        } catch (e) {
            return e;
        }
    }

    @Action({ rawError: true })
    async getProfile() {
        const r = await axios({
            method: 'GET',
            url: '/account',
        });

        track('UserIdentify', [r.data]);

        this.context.commit('setAccount', r.data);
    }

    @Action({ rawError: true })
    async update(data: TAccount) {
        await axios({
            method: 'PATCH',
            url: '/account',
            data,
        });
        this.context.dispatch('getProfile');
    }

    @Action({ rawError: true })
    async connectRedirect(payload: { platform: RewardConditionPlatform; returnUrl: string }) {
        let access_token_kind = '';
        switch (payload.platform) {
            case RewardConditionPlatform.Google: {
                access_token_kind = AccessTokenKind.YoutubeView;
                break;
            }
            case RewardConditionPlatform.Twitter: {
                access_token_kind = AccessTokenKind.Twitter;
                break;
            }
            case RewardConditionPlatform.Discord: {
                access_token_kind = AccessTokenKind.Discord;
                break;
            }
            case RewardConditionPlatform.Shopify: {
                access_token_kind = AccessTokenKind.Shopify;
                break;
            }
        }
        const client = Mixpanel.client();
        await this.userManager.signinRedirect({
            extraQueryParams: {
                prompt: 'connect',
                channel: payload.platform,
                return_url: payload.returnUrl,
                access_token_kind,
                distinct_id: client && client.get_distinct_id(),
            },
        });
    }

    @Action({ rawError: true })
    async signin(args: SigninRedirectArgs) {
        return await this.userManager.signinRedirect(args);
    }

    @Action({ rawError: true })
    async signinRedirect(payload: {
        signupToken: string;
        signupEmail: string;
        signupPlan: AccountPlanType;
        signupOffer: boolean;
        passwordResetToken: string;
        verifyEmailToken: string;
        poolTransferToken: string;
        collaboratorRequestToken: string;
        poolId: string;
        referralCode: string;
        shopifyParams: string;
    }) {
        const client = Mixpanel.client();
        const extraQueryParams: { return_url: string; distinct_id: string } = {
            return_url: BASE_URL,
            distinct_id: client && client.get_distinct_id(),
        };
        const state = {};

        if (payload.shopifyParams) {
            extraQueryParams['shopify_params'] = payload.shopifyParams;
        }

        if (payload.referralCode) {
            extraQueryParams['referral_code'] = payload.referralCode;
        }

        if (payload.poolId) {
            extraQueryParams['pool_id'] = payload.poolId;
            state['poolId'] = payload.poolId;
        }

        if (payload.poolTransferToken) {
            extraQueryParams['pool_transfer_token'] = payload.poolTransferToken;
        }

        if (payload.collaboratorRequestToken) {
            extraQueryParams['collaborator_request_token'] = payload.collaboratorRequestToken;
            state['collaboratorRequestToken'] = payload.collaboratorRequestToken;
        }

        if (payload.signupEmail) {
            extraQueryParams['signup_email'] = payload.signupEmail;
        }

        if (payload.signupPlan) {
            extraQueryParams['signup_plan'] = payload.signupPlan;
        }

        if (payload.signupOffer) {
            extraQueryParams['signup_offer'] = payload.signupOffer;
        }

        if (payload.verifyEmailToken) {
            extraQueryParams['prompt'] = 'verify_email';
            extraQueryParams['verifyEmailToken'] = payload.verifyEmailToken;
        }

        return await this.userManager.signinRedirect({
            state,
            extraQueryParams,
        });
    }

    @Action({ rawError: true })
    async accountRedirect(returnPath: string) {
        const client = Mixpanel.client();
        await this.userManager.signinRedirect({
            extraQueryParams: {
                prompt: 'account-settings',
                return_url: BASE_URL + returnPath,
                distinct_id: client && client.get_distinct_id(),
            },
        });
    }

    @Action({ rawError: true })
    async connect(kind: AccessTokenKind) {
        const client = Mixpanel.client();
        await this.userManager.signinRedirect({
            prompt: 'connect',
            extraQueryParams: {
                access_token_kind: kind,
                return_url: window.location.href,
                distinct_id: client && client.get_distinct_id(),
            },
        });
    }

    @Action({ rawError: true })
    async signinRedirectCallback() {
        const user = await this.userManager.signinRedirectCallback();
        this.context.commit('setUser', user);
    }

    @Action({ rawError: true })
    async signoutRedirect() {
        await this.userManager.signoutRedirect({});
        this.context.commit('setUser', null);
    }

    @Action({ rawError: true })
    async signout() {
        await this.userManager.removeUser();
        await this.userManager.clearStaleState();

        await axios({
            method: 'GET',
            url: config.authority + '/session/end',
        });
    }

    @Action({ rawError: true })
    async signinSilent() {
        return await this.userManager.signinSilent();
    }
}

export default AccountModule;
