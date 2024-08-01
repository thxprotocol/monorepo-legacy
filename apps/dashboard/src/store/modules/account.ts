import axios from 'axios';
import store from '..';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { track } from '@thxnetwork/common/mixpanel';
import { AccessTokenKind, OAuthScope } from '@thxnetwork/common/enums';

export type TInvoiceState = TInvoice[];

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function ({ matches }) {
    store.commit('account/setDarkMode', matches);
});

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    artifacts = '';
    version = '';
    _profile: TAccount | null = null;
    _invoices: TInvoiceState = [];
    isDarkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    get profile() {
        return this._profile;
    }

    get invoices() {
        return this._invoices;
    }

    @Mutation
    setInvoices(invoices: TInvoice[]) {
        this._invoices = invoices;
    }

    @Mutation
    setAccount(profile: TAccount) {
        this._profile = profile;
    }

    @Mutation
    setDarkMode(isEnabled: boolean) {
        this.isDarkModeEnabled = isEnabled;
        document.documentElement.classList[isEnabled ? 'add' : 'remove']('dark-mode');
    }

    @Action({ rawError: true })
    async getGuilds() {
        const { data } = await axios({
            method: 'GET',
            url: '/account/discord',
        });
        this.context.commit('setGuilds', data.guilds);
    }

    @Action({ rawError: true })
    async get() {
        const { data } = await axios({
            method: 'GET',
            url: '/account',
        });

        track('UserIdentify', [data]);

        this.context.commit('setAccount', data);
    }

    @Action({ rawError: true })
    waitForAccount() {
        return new Promise((resolve, reject) => {
            const poll = () => {
                const profile = this.context.rootGetters['account/profile'];
                if (!profile) setTimeout(poll, 100);
                return profile ? resolve('') : reject('account_invalid');
            };
            poll();
        });
    }

    @Action({ rawError: true })
    waitForToken({ kind, scopes }: { kind: AccessTokenKind; scopes: OAuthScope[] }) {
        return new Promise((resolve, reject) => {
            const poll = async () => {
                await this.context.dispatch('get');

                const account = this.context.rootGetters['account/profile'];
                if (!account) setTimeout(poll, 1000);

                const isAuthorized = account.tokens.find(
                    (token) => token.kind === kind && scopes.every((scope) => token.scopes.includes(scope)),
                );
                if (!isAuthorized) setTimeout(poll, 1000);

                return isAuthorized ? resolve('') : reject('token_invalid');
            };
            poll();
        });
    }

    @Action({ rawError: true })
    async update(data: TAccount) {
        await axios({
            method: 'PATCH',
            url: '/account',
            data,
        });
        this.context.dispatch('get');
    }

    @Action({ rawError: true })
    async listInvoices() {
        const { data } = await axios({
            method: 'GET',
            url: `/account/invoices`,
        });
        this.context.commit('setInvoices', data);
    }

    @Action({ rawError: true })
    async searchTweets(payload: { data: { operators: { [queryKey: string]: string } } }) {
        const { data } = await axios({
            method: 'POST',
            url: `/account/twitter/search`,
            data: payload.data,
        });

        return data;
    }
}

export default AccountModule;
