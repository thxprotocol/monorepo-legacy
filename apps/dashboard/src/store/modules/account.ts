import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { User, UserManager } from 'oidc-client-ts';
import { ChannelType } from '@thxprotocol/dashboard/types/rewards';
import { IAccount, IAccountUpdates, ISpotify, ITwitter, IYoutube } from '@thxprotocol/dashboard/types/account';
import { config } from '@thxprotocol/dashboard/utils/oidc';
import { BASE_URL } from '@thxprotocol/dashboard/utils/secrets';

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    artifacts = '';
    version = '';
    _networkHealth: any | null = null;
    _user!: User;
    _profile: IAccount | null = null;
    _youtube: IYoutube | null = null;
    _twitter: ITwitter | null = null;
    _spotify: ISpotify | null = null;

    get networkHealth() {
        return this._networkHealth;
    }

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

    get spotify() {
        return this._spotify;
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
    setSpotify(data: ISpotify) {
        this._spotify = data;
    }

    @Mutation
    setHealth(data: { version: string; artifacts: string }) {
        this.version = data.version;
        this.artifacts = data.artifacts;
        this._networkHealth = data;
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
    async getSpotify() {
        const r = await axios({
            method: 'GET',
            url: '/account/spotify',
        });

        this.context.commit('setSpotify', r.data.isAuthorized ? r.data : null);

        if (r.data.isAuthorized) return { spotify: r.data, isAuthorized: true };
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
    async connectRedirect(channel: ChannelType) {
        await this.userManager.signinRedirect({
            extraQueryParams: { channel, prompt: 'connect', return_url: BASE_URL + '/integrations' },
        });
    }

    @Action({ rawError: true })
    async signinRedirect(payload: { signupToken: string; signupEmail: string; passwordResetToken: string }) {
        const extraQueryParams: any = {
            return_url: BASE_URL,
        };

        if (payload.signupToken) {
            extraQueryParams['prompt'] = 'confirm';
            extraQueryParams['signup_token'] = payload.signupToken;
        }

        if (payload.passwordResetToken) {
            extraQueryParams['prompt'] = 'reset';
            extraQueryParams['password_reset_token'] = payload.passwordResetToken;
        }

        await this.userManager.clearStaleState();

        return await this.userManager.signinRedirect({
            extraQueryParams,
        });
    }

    @Action({ rawError: true })
    async accountRedirect(returnPath: string) {
        await this.userManager.signinRedirect({
            extraQueryParams: { prompt: 'account-settings', return_url: BASE_URL + returnPath },
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
        return user;
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

    @Action({ rawError: true })
    async getHealth() {
        const r = await axios({
            method: 'GET',
            url: '/health',
        });

        this.context.commit('setHealth', r.data);
    }
}

export default AccountModule;
