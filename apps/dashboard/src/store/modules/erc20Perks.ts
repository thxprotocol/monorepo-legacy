import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from './pools';
import { RewardConditionPlatform, type TERC20Perk } from '@thxnetwork/types/index';

export type RewardByPage = {
    [page: number]: TERC20Perk[];
};

export type TERC20PerkState = {
    [poolId: string]: {
        [id: string]: TERC20Perk;
    };
};

export type RewardListProps = {
    pool: IPool;
    page: number;
    limit: number;
};

@Module({ namespaced: true })
class ERC20PerkModule extends VuexModule {
    _all: TERC20PerkState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TERC20Perk & { _id: string }; pool: IPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TERC20Perk) {
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
            url: '/erc20-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TERC20Perk) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: IPool; payload: TERC20Perk }) {
        const r = await axios({
            method: 'POST',
            url: '/erc20-rewards',
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });

        this.context.commit('set', { pool: payload, reward: r.data });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: IPool; reward: TERC20Perk; payload: TERC20Perk }) {
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
    async getQRCodes({ reward }: { reward: TERC20Perk }) {
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

    @Action({ rawError: true })
    async delete(reward: TERC20Perk) {
        await axios({
            method: 'DELETE',
            url: `/erc20-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default ERC20PerkModule;
