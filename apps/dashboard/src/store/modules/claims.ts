import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

export type TQRCodeEntry = {
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

export type TQRCodeEntryURLData = TQRCodeEntry & {
    chainId: ChainId;
    poolAddress: string;
    tokenSymbol: string;
    withdrawAmount: number;
    clientId: string;
};

export interface IClaims {
    [poolId: string]: { [id: string]: TQRCodeEntry };
}

@Module({ namespaced: true })
class ClaimModule extends VuexModule {
    _all: IClaims = {};

    get all() {
        return this._all;
    }

    @Mutation
    setClaim(claim: TQRCodeEntry) {
        if (!this._all[claim.poolId]) {
            Vue.set(this._all, claim.poolId, {});
        }
        Vue.set(this._all[claim.poolId], claim.uuid, claim);
    }

    @Mutation
    setClaimURLData(claim: TQRCodeEntryURLData) {
        if (!this._all[claim.poolId]) {
            Vue.set(this._all, claim.poolId, {});
        }
        Vue.set(this._all[claim.poolId], claim.uuid, claim);
    }

    @Action({ rawError: true })
    async get(id: string, poolId: string) {
        const r = await axios({
            method: 'GET',
            url: `/qr-codes/${id}`,
            headers: { 'X-PoolId': poolId },
        });

        this.context.commit('setClaimURLData', r.data);
    }

    @Action({ rawError: true })
    async list({ rewardId, poolId }: { rewardId: string; poolId: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/qr-codes`,
            params: {
                rewardId,
                poolId,
            },
        });

        for (const claim of data) {
            this.context.commit('setClaim', claim);
        }
    }
}

export default ClaimModule;
