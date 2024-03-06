import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { track } from '@thxnetwork/common/mixpanel';

@Module({ namespaced: true })
class ClientModule extends VuexModule {
    _all: TClientState = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ pool, client }: { pool: TPool; client: TClient }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], client._id, client);
    }

    @Action({ rawError: true })
    async list(pool: TPool) {
        const { data } = await axios({
            method: 'GET',
            url: '/clients',
            headers: { 'X-PoolId': pool._id },
        });

        data.forEach((client: TClient) => {
            this.context.commit('set', { pool, client });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: TPool; payload: TClient }) {
        const { data } = await axios({
            method: 'POST',
            url: '/clients',
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'client']);

        this.context.commit('set', { pool, client: data });
    }

    @Action({ rawError: true })
    async update({ pool, payload }: { pool: TPool; payload: TClient }) {
        const { data } = await axios({
            method: 'PATCH',
            url: '/clients/' + payload._id,
            headers: { 'X-PoolId': pool._id },
            data: { name: payload.name },
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
