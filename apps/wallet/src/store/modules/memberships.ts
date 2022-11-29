import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';

export type TMembership = {
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
    [id: string]: TMembership;
}

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: IMemberships = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(membership: TMembership) {
        Vue.set(this._all, membership._id, membership);
    }

    @Mutation
    unset(membership: TMembership) {
        Vue.delete(this._all, membership._id);
    }

    @Action({ rawError: true })
    async list() {
        const { data } = await axios({
            method: 'GET',
            url: '/memberships',
            params: { chainId: this.context.rootGetters['network/chainId'] },
        });

        await Promise.all(
            data.map(async ({ _id }: TMembership) => {
                try {
                    await this.context.dispatch('get', _id);
                } catch {
                    // Fail silently
                }
            }),
        );
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
        const { data } = await axios({
            method: 'GET',
            url: '/memberships/' + _id,
        });
        this.context.commit('set', data);
    }
}

export default MembershipModule;
