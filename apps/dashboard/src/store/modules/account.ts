import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { User, UserManager } from 'oidc-client-ts';
import { config } from '@thxnetwork/dashboard/utils/oidc';
import { BASE_URL } from '@thxnetwork/dashboard/utils/secrets';
import type { IAccount, IAccountUpdates, IDiscord, ITwitter, IYoutube } from '@thxnetwork/dashboard/types/account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { RewardConditionPlatform } from '@thxnetwork/types/enums/RewardConditionPlatform';
import { mixpanelClient, track } from '@thxnetwork/dashboard/utils/mixpanel';

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    artifacts = '';
    version = '';
    _user!: User;
    _profile: IAccount | null = null;
    _youtube: IYoutube | null = null;
    _twitter: ITwitter | null = null;
    _discord: IDiscord | null = null;

    get user() {
        return this._user;
    }

    get profile() {
        return this._profile;
    }

    get youtube() {
        return this._youtube;
    }

    get twitter() {
        return this._twitter;
    }

    get discord() {
        return this._discord;
    }

    @Mutation
    setUser(user: User) {
        this._user = user;
    }

    @Mutation
    setAccount(profile: IAccount) {
        this._profile = profile;
    }

    @Mutation
    setYoutube(data: IYoutube) {
        this._youtube = data;
    }

    @Mutation
    setTwitter(data: ITwitter) {
        this._twitter = data;
    }

    @Mutation
    setDiscord(data: IDiscord) {
        this._discord = data;
    }

    @Mutation
    setHealth(data: { version: string; artifacts: string }) {
        this.version = data.version;
        this.artifacts = data.artifacts;
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
    async getYoutube() {
        const r = await axios({
            method: 'GET',
            url: '/account/youtube',
        });

        this.context.commit('setYoutube', r.data.isAuthorized ? r.data : null);

        if (r.data.isAuthorized) return { youtube: r.data, isAuthorized: true };
        return { isAuthorized: false };
    }

    @Action({ rawError: true })
    async getTwitter() {
        const r = await axios({
            method: 'GET',
            url: '/account/twitter',
        });

        this.context.commit('setTwitter', r.data.isAuthorized ? r.data : null);

        if (r.data.isAuthorized) return { twitter: r.data, isAuthorized: true };
        return { isAuthorized: false };
    }

    @Action({ rawError: true })
    async getDiscord() {
        const r = await axios({
            method: 'GET',
            url: '/account/discord',
        });

        this.context.commit('setDiscord', r.data.isAuthorized ? r.data : null);

        if (r.data.isAuthorized) return { discord: r.data, isAuthorized: true };
        return { isAuthorized: false };
    }

    @Action({ rawError: true })
    async update(data: IAccountUpdates) {
        const r = await axios({
            method: 'PATCH',
            url: '/account',
            data,
        });

        this.context.commit('setAccount', r.data);
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
        }
        await this.userManager.signinRedirect({
            extraQueryParams: {
                prompt: 'connect',
                channel: payload.platform,
                return_url: payload.returnUrl,
                access_token_kind,
                distinct_id: mixpanelClient().get_distinct_id(),
            },
        });
    }

    @Action({ rawError: true })
    async signinRedirect(payload: {
        signupToken: string;
        signupEmail: string;
        passwordResetToken: string;
        verifyEmailToken: string;
    }) {
        const extraQueryParams: any = {
            return_url: BASE_URL,
            // distinct_id: mixpanelClient().get_distinct_id(),
        };

        if (payload.signupEmail) {
            extraQueryParams['signupEmail'] = payload.signupEmail;
        }

        if (payload.signupToken) {
            extraQueryParams['prompt'] = 'confirm';
            extraQueryParams['signup_token'] = payload.signupToken;
        }

        if (payload.passwordResetToken) {
            extraQueryParams['prompt'] = 'reset';
            extraQueryParams['password_reset_token'] = payload.passwordResetToken;
        }

        if (payload.verifyEmailToken) {
            extraQueryParams['prompt'] = 'verify_email';
            extraQueryParams['verifyEmailToken'] = payload.verifyEmailToken;
        }

        await this.userManager.clearStaleState();

        return await this.userManager.signinRedirect({
            extraQueryParams,
        });
    }

    @Action({ rawError: true })
    async accountRedirect(returnPath: string) {
        await this.userManager.signinRedirect({
            extraQueryParams: {
                prompt: 'account-settings',
                return_url: BASE_URL + returnPath,
                // distinct_id: mixpanelClient().get_distinct_id(),
            },
        });
    }

    @Action({ rawError: true })
    async signupRedirect() {
        await this.userManager.clearStaleState();
        const url = new URL(window.location.href);
        const signupEmail = url.searchParams.get('signup_email');

        const extraQueryParams: any = {
            prompt: 'create',
            return_url: BASE_URL,
            distinct_id: mixpanelClient().get_distinct_id(),
        };

        if (signupEmail) {
            extraQueryParams['signup_email'] = signupEmail;
        }

        return await this.userManager.signinRedirect({
            extraQueryParams,
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
