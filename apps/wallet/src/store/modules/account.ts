import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { User, UserManager } from 'oidc-client-ts';
import { config } from '@thxnetwork/wallet/utils/oidc';
import { getPrivateKeyForUser } from '@thxnetwork/wallet/utils/torus';
import { isPrivateKey } from '@thxnetwork/wallet/utils/network';
import { BASE_URL } from '@thxnetwork/wallet/utils/secrets';

export interface UserProfile {
    address: string;
    privateKey: string;
}

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    userManager: UserManager = new UserManager(config);
    _user: User | null = null;
    _profile: UserProfile | null = null;
    _privateKey = '';

    get user() {
        return this._user;
    }

    get privateKey() {
        if (this._privateKey) return this._privateKey;
        if (!this._user) return '';
        const encoded = sessionStorage.getItem(`thx:wallet:user:${this._user.profile.sub}`) as string;
        return atob(encoded);
    }

    get profile() {
        return this._profile;
    }

    @Mutation
    setUser(user: User) {
        this._user = user;
    }

    @Mutation
    setPrivateKey({ sub, privateKey }: { sub: string; privateKey: string }) {
        sessionStorage.setItem(`thx:wallet:user:${sub}`, btoa(privateKey));
        this._privateKey = privateKey;
    }

    @Mutation
    setUserProfile(profile: UserProfile) {
        this._profile = profile;
    }

    @Action({ rawError: true })
    async getUser() {
        const user = await this.userManager.getUser();

        this.context.commit('setUser', user);
        this.context.dispatch('getProfile');

        return user;
    }

    @Action({ rawError: true })
    async getProfile() {
        const r = await axios({
            method: 'GET',
            url: '/account',
        });

        this.context.commit('setUserProfile', r.data);
    }

    @Action({ rawError: true })
    async getPrivateKey(user: User) {
        const privateKey = await getPrivateKeyForUser(user);

        if (privateKey && isPrivateKey(privateKey) && this.user) {
            this.context.commit('setPrivateKey', { sub: this.user.profile.sub, privateKey });
        }

        return { privateKey };
    }

    @Action({ rawError: true })
    async update(data: UserProfile) {
        try {
            const r = await axios({
                method: 'PATCH',
                url: '/account',
                data,
            });

            this.context.commit('setUserProfile', r.data);
        } catch (error) {
            return error;
        }
    }

    @Action({ rawError: true })
    async signinRedirect(
        payload: {
            signupToken?: string;
            token?: string;
            key?: string;
            passwordResetToken?: string;
            rewardHash?: string;
            toPath?: string;
        } = {},
    ) {
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

        if (payload.token) {
            extraQueryParams['authentication_token'] = payload.token.replace(/\s/g, '+');
        }

        if (payload.key) {
            extraQueryParams['secure_key'] = payload.key.replace(/\s/g, '+');
        }

        if (payload.rewardHash) {
            extraQueryParams['reward_hash'] = payload.rewardHash;
        }

        await this.userManager.clearStaleState();

        return await this.userManager.signinRedirect({
            state: { toPath: payload.toPath, rewardHash: payload.rewardHash },
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
    async signupRedirect() {
        await this.userManager.clearStaleState();
        await this.userManager.signinRedirect({
            prompt: 'create',
            extraQueryParams: { return_url: BASE_URL },
        });
    }

    @Action({ rawError: true })
    async accountRedirect(path: string) {
        await this.userManager.signinRedirect({
            extraQueryParams: { prompt: 'account-settings', return_url: BASE_URL + path },
        });
    }

    @Action({ rawError: true })
    async signoutRedirect() {
        await this.userManager.signoutRedirect({});
    }

    @Action({ rawError: true })
    signinSilent() {
        this.userManager.signinSilent();
    }

    @Action({ rawError: true })
    signinSilentCallback() {
        this.userManager.signinSilentCallback();
    }
}

export default AccountModule;
