import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { IMember } from '@thxnetwork/dashboard/types/account';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

export interface IPool {
    _id: string;
    variant: string;
    address: string;
    chainId: ChainId;
    rewardPollDuration: number;
    proposeWithdrawPollDuration: number;
    metrics: { claims: number; mints: number; referrals: number; withdrawals: number };
    isNFTPool: boolean;
    isDefaultPool: boolean;
    version: string;
    archived: boolean;
}

export interface GetMembersProps {
    pool: IPool;
    page: number;
    limit: number;
}

const MEMBERS_RESPONSE_ARR: IMember[] = [{ poolAddress: '0x000', memberId: 1, address: '0x11' }];
const MEMBERS_RESPONSE: GetMembersResponse = {
    results: MEMBERS_RESPONSE_ARR,
    limit: 10,
    total: 1,
};

export interface GetMembersResponse {
    results: IMember[];
    next?: { page: number };
    previous?: { page: number };
    limit: number;
    total: number;
}

export interface IPools {
    [id: string]: IPool;
}

@Module({ namespaced: true })
class PoolModule extends VuexModule {
    _all: IPools = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(pool: IPool) {
        Vue.set(this._all, pool._id, pool);
    }

    @Mutation
    unset(pool: IPool) {
        Vue.delete(this._all, pool._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        this.context.commit('clear');

        const r = await axios({
            method: 'GET',
            url: '/pools',
            params,
        });

        r.data.forEach((_id: string) => {
            this.context.commit('set', { _id });
        });
    }

    @Action({ rawError: true })
    async read(_id: string) {
        const r = await axios({
            method: 'get',
            url: '/pools/' + _id,
        });

        this.context.commit('set', r.data);

        return r.data;
    }

    @Action({ rawError: true })
    async create(payload: {
        network: number;
        token: string;
        erc20tokens: string[];
        erc721tokens: string[];
        variant: string;
    }) {
        const { data } = await axios({
            method: 'POST',
            url: '/pools',
            data: payload,
        });

        const r = await axios({
            method: 'GET',
            url: '/pools/' + data._id,
            headers: { 'X-PoolId': data._id },
        });

        this.context.commit('set', r.data);
    }

    @Action({ rawError: true })
    async addMember(payload: { pool: IPool; address: string }) {
        const { data } = await axios({
            method: 'POST',
            url: '/members',
            headers: { 'X-PoolId': payload.pool._id },
            data: { address: payload.address },
        });

        return data;
    }

    @Action({ rawError: true })
    async update({ pool, data }: { pool: IPool; data: { archived: boolean } }) {
        await axios({
            method: 'PATCH',
            url: '/pools/' + pool._id,
            data,
            headers: { 'X-PoolId': pool._id },
        });
        this.context.commit('set', { ...pool, ...data });

        if (data.archived) {
            this.context.commit('unset', pool);
        }
    }

    @Action({ rawError: true })
    async remove(pool: IPool) {
        await axios({
            method: 'DELETE',
            url: '/pools/' + pool._id,
            headers: { 'X-PoolId': pool._id },
        });

        this.context.commit('unset', pool);
    }

    @Action({ rawError: true })
    async getMembers({ pool, page, limit }: GetMembersProps): Promise<GetMembersResponse | undefined> {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const r = await axios({
            method: 'GET',
            url: '/members',
            headers: {
                'X-PoolId': pool._id,
            },
            params,
        });

        return r.data.results.length ? r.data : MEMBERS_RESPONSE;
    }

    @Action({ rawError: true })
    async topup({ amount, poolId }: { amount: number; poolId: string }) {
        await axios({
            method: 'POST',
            url: '/pools/' + poolId + '/topup',
            headers: { 'X-PoolId': poolId },
            data: { amount },
        });
    }
}

export default PoolModule;
