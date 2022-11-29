import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from './pools';
import { TERC20Reward } from '@thxnetwork/types/index';

export type RewardByPage = {
    [page: number]: TERC20Reward[];
};

export type TRewardState = {
    [poolId: string]: {
        [id: string]: TERC20Reward;
    };
};

export type RewardListProps = {
    pool: IPool;
    page: number;
    limit: number;
};

@Module({ namespaced: true })
class ERC20RewardModule extends VuexModule {
    _all: TRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TERC20Reward & { _id: string }; pool: IPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    setTotal({ pool, total }: { pool: IPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }: RewardListProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc20-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TERC20Reward) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: IPool; payload: TERC20Reward }) {
        const r = await axios({
            method: 'POST',
            url: '/erc20-rewards',
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });

        this.context.commit('set', { pool: payload, reward: r.data });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: IPool; reward: TERC20Reward; payload: TERC20Reward }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc20-rewards/${reward._id}`,
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });

        this.context.commit('set', {
            pool: pool,
            reward: data,
        });
    }

    @Action({ rawError: true })
    async getQRCodes({ reward }: { reward: TERC20Reward }) {
        const { status, data } = await axios({
            method: 'GET',
            url: `/erc20-rewards/${reward._id}/claims/qrcode`,
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
            anchor.setAttribute('download', `${reward.uuid}_qrcodes.zip`);
            document.body.appendChild(anchor);
            anchor.click();
        }
    }
}

export default ERC20RewardModule;
