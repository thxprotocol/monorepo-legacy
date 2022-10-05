import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';

export type TDeposit = {
    id: string;
};

export interface IPromoCodes {
    [poolAddress: string]: {
        [id: string]: TDeposit;
    };
}

@Module({ namespaced: true })
class DepositsModule extends VuexModule {
    _all: IPromoCodes = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ deposit, membership }: { deposit: TDeposit; membership: Membership }) {
        if (!this._all[membership._id]) {
            Vue.set(this._all, membership._id, {});
        }
        Vue.set(this._all[membership._id], deposit.id, deposit);
    }

    @Mutation
    unset({ deposit, membership }: { deposit: TDeposit; membership: Membership }) {
        Vue.delete(this._all[membership._id], deposit.id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async create({
        membership,
        amount,
        item,
        calldata,
    }: {
        membership: Membership;
        amount: number;
        item: string;
        calldata: any;
    }) {
        const { call, nonce, sig } = calldata;
        const { data } = await axios({
            method: 'POST',
            url: '/deposits',
            headers: {
                'X-PoolId': membership.poolId,
            },
            data: {
                call,
                nonce,
                sig,
                amount,
                item,
            },
        });

        this.context.commit('set', { deposit: data, membership });

        return { deposit: data };
    }
}

export default DepositsModule;
