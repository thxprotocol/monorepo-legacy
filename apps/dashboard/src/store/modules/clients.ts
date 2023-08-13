import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import type { TPool, TClient, TClientState } from '@thxnetwork/types/interfaces';
import { track } from '@thxnetwork/mixpanel';

@Module({ namespaced: true })
class ClientModule extends VuexModule {
    _all: TClientState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, client }: { pool: TPool; client: TClient }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], client._id, client);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ page = 1, limit, pool }: { limit: number; page: number; pool: TPool }) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data } = await axios({
            method: 'GET',
            url: '/clients',
            headers: { 'X-PoolId': pool._id },
            params,
        });

        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((client: TClient) => {
            client.page = page;
            this.context.commit('set', { pool, client });
            this.context.dispatch('get', { pool, client });
        });
    }

    @Action({ rawError: true })
    async create(payload: TClient) {
        debugger;
        const { data } = await axios({
            method: 'POST',
            url: '/clients',
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        debugger;
        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'client']);

        this.context.commit('set', { ...payload, ...data });
    }

    @Action({ rawError: true })
    async update({ _id, name, pool }: TClient & { pool: TPool }) {
        const { data } = await axios({
            method: 'PATCH',
            url: '/clients/' + _id,
            headers: { 'X-PoolId': pool._id },
            data: { name },
        });

        this.context.commit('set', { pool, client: data });
    }

    @Action({ rawError: true })
    async get({ client, pool }: { client: TClient; pool: TPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/clients/' + client._id,
            headers: { 'X-PoolId': pool._id },
            data: { clientId: client.clientId },
        });

        const existingClient = this.context.rootGetters['clients/all'][pool._id][client._id];
        const updatedClient = { ...existingClient, ...data };
        this.context.commit('set', { pool, client: updatedClient });
    }
}

export default ClientModule;
