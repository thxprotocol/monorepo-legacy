import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from './pools';
import { RewardConditionPlatform, TERC721Reward } from '@thxnetwork/types/index';

export type RewardByPage = {
    [page: number]: TERC721Reward[];
};

export type TRewardState = {
    [poolId: string]: {
        [id: string]: TERC721Reward;
    };
};

export type RewardListProps = {
    pool: IPool;
    page: number;
    limit: number;
};

@Module({ namespaced: true })
class ERC721RewardModule extends VuexModule {
    _all: TRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TERC721Reward & { _id: string }; pool: IPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TERC721Reward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: IPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }: RewardListProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TERC721Reward) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: IPool; payload: TERC721Reward }) {
        const r = await axios({
            method: 'POST',
            url: '/erc721-rewards',
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });

        this.context.commit('set', { pool, reward: r.data });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: IPool; reward: TERC721Reward; payload: TERC721Reward }) {
        console.log(reward._id);
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc721-rewards/${reward._id}`,
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });
        this.context.commit('set', {
            pool,
            reward: { ...reward, ...data },
        });
    }

    @Action({ rawError: true })
    async getQRCodes({ reward }: { reward: TERC721Reward }) {
        const { status, data } = await axios({
            method: 'GET',
            url: `/erc721-rewards/${reward._id}/claims/qrcode`,
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

    @Action({ rawError: true })
    async delete(reward: TERC721Reward) {
        await axios({
            method: 'DELETE',
            url: `/erc721-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default ERC721RewardModule;
