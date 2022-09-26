import axios, { AxiosResponse } from 'axios';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { IPool } from './pools';

export type TClient = {
    _id: string;
    page: number;
    name: string;
    sub: string;
    poolId: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    createdAt: Date;
};

export type ClientByPage = {
    [page: number]: TClient[];
};

export type PaginationParams = Partial<{
    page: number;
    limit: number;
}>;

export type ClientListProps = PaginationParams & {
    pool: IPool;
};

export type GetClientProps = {
    client: TClient;
    pool: IPool;
};

export type TClientResponse = AxiosResponse<
    TClientMeta & {
        results: TClient[];
    }
>;

export type TClientMeta = {
    limit: number;
    total: number;
    next?: { page: number };
    previous?: { page: number };
};

export type TClientCreate = {
    name: string;
    page: number;
    pool: IPool;
    grantType: string;
    redirectUri: string;
    requestUri: string;
};

export type TClientState = {
    [poolId: string]: TClientMeta & {
        byPage: ClientByPage;
    };
};

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
    set({ pool, client }: { pool: IPool; client: TClient }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], client._id, client);
    }

    @Mutation
    setTotal({ pool, total }: { pool: IPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ page = 1, limit, pool }: ClientListProps) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data }: TClientResponse = await axios({
            method: 'GET',
            url: '/clients',
            headers: { 'X-PoolId': pool._id },
            params,
        });

        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((client: TClient) => {
            client.page = page;
            this.context.commit('set', { pool, client });
        });
    }

    @Action({ rawError: true })
    async create({ name, page, pool, grantType, redirectUri, requestUri }: TClientCreate) {
        const { data } = await axios({
            method: 'POST',
            url: '/clients',
            headers: { 'X-PoolId': pool._id },
            data: { name, grantType, redirectUri, requestUri },
        });
        data.page = page;
        this.context.commit('set', { pool, client: data });
    }

    @Action({ rawError: true })
    async update({ _id, name, pool }: TClientCreate & TClient) {
        const { data } = await axios({
            method: 'PATCH',
            url: '/clients/' + _id,
            headers: { 'X-PoolId': pool._id },
            data: { name },
        });

        this.context.commit('set', { pool, client: data });
    }

    @Action({ rawError: true })
    async get({ client, pool }: GetClientProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/clients/' + client._id,
            headers: { 'X-PoolId': pool._id },
            data: { clientId: client.clientId },
        });

        const existingClient = this.context.rootGetters['clients/all'][pool._id][client._id];
        // Override existing props but keep props (like page) undefined in the new data.
        const updatedClient = { ...existingClient, ...data };
        this.context.commit('set', { pool, client: updatedClient });
    }
}

export default ClientModule;
