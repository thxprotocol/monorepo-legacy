import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IRewardCondition, Reward } from '@thxnetwork/dashboard/types/rewards';
import { IPool } from './pools';

export type TReward = { page: number } & Reward;

export type RewardByPage = {
    [page: number]: TReward[];
};

export type TRewardState = {
    [poolId: string]: {
        [id: string]: TReward;
    };
};

export type RewardListProps = {
    poolId: string;
    page: number;
    limit: number;
};

@Module({ namespaced: true })
class RewardModule extends VuexModule {
    _all: TRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: Reward; pool: string }) {
        if (!this._all[pool]) {
            Vue.set(this._all, pool, {});
        }
        Vue.set(this._all[pool], reward.id, reward);
    }

    @Mutation
    setTotal({ poolId, total }: { poolId: string; total: number }) {
        Vue.set(this._totals, poolId, total);
    }

    @Action({ rawError: true })
    async list({ poolId, page, limit }: RewardListProps) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data } = await axios({
            method: 'GET',
            url: '/rewards',
            headers: { 'X-PoolId': poolId },
            params,
        });

        this.context.commit('setTotal', { poolId, total: data.total });

        data.results.forEach((reward: TReward) => {
            reward.page = page;
            this.context.commit('set', { pool: poolId, reward });
        });
    }

    @Action({ rawError: true })
    async create(payload: {
        slug: string;
        title: string;
        poolId: string;
        erc721metadataId: string;
        withdrawLimit: number;
        withdrawAmount: number;
        withdrawDuration: number;
        withdrawUnlockDate: Date;
        isClaimOnce: boolean;
        isMembershipRequired: boolean;
        withdrawCondition?: IRewardCondition;
        expiryDate?: string;
        amount: number;
    }) {
        const r = await axios({
            method: 'POST',
            url: '/rewards',
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });

        this.context.commit('set', { pool: payload.poolId, reward: r.data });
    }

    @Action({ rawError: true })
    async update({ pool, reward }: { pool: IPool; reward: TReward }) {
        const r = await axios({
            method: 'PATCH',
            url: `/rewards/${reward.id}`,
            headers: { 'X-PoolId': pool._id },
            data: reward,
        });

        this.context.commit('set', { pool: reward.poolId, reward: { ...reward, ...r.data } });
    }

    @Action({ rawError: true })
    async getQRCodes({ reward }: { reward: Reward }) {
        const { status, data } = await axios({
            method: 'GET',
            url: `/rewards/${reward.id}/claims/qrcode`,
            headers: { 'X-PoolId': reward.poolId },
            responseType: 'blob',
        });
        // Check if job has been queued, meaning file is not available yet
        if (status === 201) return true;
        // Check if response is zip file, meaning job has completed
        if (status === 200 && data.type == 'application/zip') {
            // Fake an anchor click to trigger a download in the browser
            const anchor = document.createElement('a');
            anchor.href = window.URL.createObjectURL(new Blob([data]));
            anchor.setAttribute('download', `${reward._id}_qrcodes.zip`);
            document.body.appendChild(anchor);
            anchor.click();
        }
    }
}

export default RewardModule;
