import axios from 'axios';
import Web3 from 'web3';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { BASE_URL } from '@thxnetwork/wallet/utils/secrets';
import { thxClient } from '../../utils/oidc';
import { User } from 'oidc-client-ts';
import { AccountVariant } from '../../types/Accounts';
import { AccessTokenKind, RewardConditionPlatform } from '@thxnetwork/types/index';
const AUTH_REQUEST_TYPED_MESSAGE =
    "Welcome! Please make sure you have selected your preferred account and sign this message to verify it's ownership.";

export interface UserProfile {
    address: string;
    privateKey: string;
    authRequestMessage: string;
    authRequestSignature: string;
    variant: AccountVariant;
    googleAccess: boolean;
    youtubeViewAccess: boolean;
    youtubeManageAccess: boolean;
    twitterAccess: boolean;
    discordAccess: boolean;
}

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    _user: User | null = null;
    _profile: UserProfile | null = null;

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
    setUserProfile(profile: UserProfile) {
        this._profile = profile;
    }

    @Action({ rawError: true })
    async getUser() {
        const user = await thxClient.userManager.getUser();
        if (user?.expired) return;

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
    async update(payload: UserProfile) {
        if (this._user && this._user.profile.address !== payload.address) {
            const web3: Web3 & { eth: { ethSignTypedDataV4: any } } = this.context.rootState.network.web3;
            const privateKey = this.context.rootState.network.privateKey;

            if (privateKey) {
                const account = web3.eth.accounts.privateKeyToAccount(privateKey);
                const signature = await web3.eth.sign(AUTH_REQUEST_TYPED_MESSAGE, account.address);
                payload.authRequestMessage = AUTH_REQUEST_TYPED_MESSAGE;
                payload.authRequestSignature = signature;
            } else {
                // Do metamask signature
            }
        }

        const r = await axios({
            method: 'PATCH',
            url: '/account',
            data: payload,
        });

        this.context.commit('setUserProfile', r.data);
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
            claimUuid?: string;
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

        if (payload.claimUuid) {
            extraQueryParams['claim_id'] = payload.claimUuid;
        }

        await thxClient.userManager.cached.clearStaleState();

        return await thxClient.userManager.cached.signinRedirect({
            state: {
                toPath: payload.toPath,
                rewardHash: payload.rewardHash,
                claimUuid: payload.claimUuid,
            },
            extraQueryParams,
        });
    }

    @Action({ rawError: true })
    async signinRedirectCallback() {
        const user = await thxClient.userManager.signinRedirectCallback();
        this.context.commit('setUser', user);
        return user;
    }

    @Action({ rawError: true })
    async signupRedirect() {
        await thxClient.userManager.cached.clearStaleState();
        await thxClient.userManager.cached.signinRedirect({
            prompt: 'create',
            extraQueryParams: { return_url: BASE_URL },
        });
    }

    @Action({ rawError: true })
    async accountRedirect(path: string) {
        await thxClient.userManager.cached.signinRedirect({
            extraQueryParams: {
                prompt: 'account-settings',
                return_url: BASE_URL + path,
            },
        });
    }

    @Action({ rawError: true })
    async signoutRedirect(toPath: string) {
        await thxClient.userManager.cached.signoutRedirect({ state: { toPath } });
    }

    @Action({ rawError: true })
    signinSilent() {
        thxClient.userManager.cached.signinSilent();
    }

    @Action({ rawError: true })
    signinSilentCallback() {
        thxClient.userManager.cached.signinSilentCallback();
    }

    @Action({ rawError: true })
    async connectRedirect({ platform, path }: { platform: RewardConditionPlatform; path: string }) {
        let access_token_kind = '';
        switch (platform) {
            case RewardConditionPlatform.Google: {
                access_token_kind = AccessTokenKind.YoutubeManage;
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
        await thxClient.userManager.cached.signinRedirect({
            extraQueryParams: {
                channel: platform,
                prompt: 'connect',
                return_url: BASE_URL + path,
                access_token_kind,
            },
        });
    }
}

export default AccountModule;
