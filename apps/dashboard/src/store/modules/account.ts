import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { track } from '@thxnetwork/common/mixpanel';

export type TInvoiceState = TInvoice[];

@Module({ namespaced: true })
class AccountModule extends VuexModule {
    artifacts = '';
    version = '';
    _profile: TAccount | null = null;
    _invoices: TInvoiceState = [];

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

        // const { poolId, collaboratorRequestToken } = this.state as any;
        // if (poolId && collaboratorRequestToken) {
        //     await this.context.dispatch(
        //         'pools/updateCollaborator',
        //         { poolId, uuid: collaboratorRequestToken },
        //         { root: true },
        //     );
        // }

        this.context.commit('setAccount', data);
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
