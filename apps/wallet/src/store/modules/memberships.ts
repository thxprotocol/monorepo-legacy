import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';

export type Membership = {
    _id: string;
    sub: string;
    chainId: ChainId;
    token: any;
    tokens: any;
    poolId: string;
    poolAddress: string;
    erc20Id: string;
    erc721Id: string;
    poolBalance?: number;
    pendingBalance?: number;
};

export interface IMemberships {
    [id: string]: Membership;
}

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: IMemberships = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(membership: Membership) {
        Vue.set(this._all, membership._id, membership);
    }

    @Mutation
    unset(membership: Membership) {
        Vue.delete(this._all, membership._id);
    }

    @Action({ rawError: true })
    async getAll() {
        const r = await axios({
            method: 'GET',
            url: '/memberships',
        });

        r.data.forEach((_id: string) => {
            this.context.commit('set', { _id });
        });
    }

    @Action({ rawError: true })
    async delete(_id: string) {
        await axios({
            method: 'DELETE',
            url: `/memberships/${_id}`,
        });

        this.context.commit('unset', { _id });
    }

    @Action({ rawError: true })
    async get(_id: string) {
        try {
            const { data } = await axios({
                method: 'GET',
                url: '/memberships/' + _id,
            });
            this.context.commit('set', data);
        } catch {
            //
        }
    }
}

export default MembershipModule;
