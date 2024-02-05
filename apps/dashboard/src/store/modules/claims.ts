import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

export type TClaim = {
    _id: string;
    sub?: string;
    uuid: string;
    poolId: string;
    erc20Id?: string;
    erc721Id?: string;
    claimedAt?: string;
    rewardUuid: string;
    createdAt: string;
    page: number;
};

export type TClaimURLData = TClaim & {
    chainId: ChainId;
    poolAddress: string;
    tokenSymbol: string;
    withdrawAmount: number;
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
        Vue.set(this._all[claim.poolId], claim.uuid, claim);
    }

    setClaimURLData(claim: TClaimURLData) {
        if (!this._all[claim.poolId]) {
            Vue.set(this._all, claim.poolId, {});
        }
        Vue.set(this._all[claim.poolId], claim.uuid, claim);
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
    async list(rewardUuid: number, poolId: string) {
        const r = await axios({
            method: 'GET',
            url: `/claims/reward/${rewardUuid}`,
            headers: { 'X-PoolId': poolId },
        });

        for (const claim of r.data) {
            this.context.commit('setClaim', claim);
        }
    }
}

export default ClaimModule;
