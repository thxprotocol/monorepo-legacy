import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IRewardCondition } from '@thxnetwork/dashboard/types/rewards';

export type TClaim = {
    _id: string;
    poolId: string;
    erc20Id?: string;
    erc721Id?: string;
    rewardId: number;
};

export type TClaimURLData = TClaim & {
    chainId: ChainId;
    poolAddress: string;
    tokenSymbol: string;
    withdrawAmount: number;
    withdrawCondition?: IRewardCondition;
    clientId: string;
};

export interface IClaims {
    [poolId: string]: { [id: string]: TClaim };
}

@Module({ namespaced: true })
class ClaimModule extends VuexModule {
    _all: IClaims = {};

    get all() {
        return this._all;
    }

    @Mutation
    setClaim(claim: TClaim) {
        if (!this._all[claim.poolId]) {
            Vue.set(this._all, claim.poolId, {});
        }
        Vue.set(this._all[claim.poolId], claim._id, claim);
    }

    setClaimURLData(claim: TClaimURLData) {
        if (!this._all[claim.poolId]) {
            Vue.set(this._all, claim.poolId, {});
        }
        Vue.set(this._all[claim.poolId], claim._id, claim);
    }

    @Action({ rawError: true })
    async get(id: string, poolId: string) {
        const r = await axios({
            method: 'GET',
            url: `/claims/${id}`,
            headers: { 'X-PoolId': poolId },
        });

        this.context.commit('setClaimURLData', r.data);
    }

    @Action({ rawError: true })
    async list(rewardId: number, poolId: string) {
        const r = await axios({
            method: 'GET',
            url: `/claims/reward/${rewardId}`,
            headers: { 'X-PoolId': poolId },
        });

        for (const claim of r.data) {
            this.context.commit('setClaim', claim);
        }
    }
}

export default ClaimModule;
