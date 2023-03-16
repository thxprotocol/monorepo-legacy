import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { type TPool } from '@thxnetwork/types/index';
import { RewardConditionPlatform, type TERC20Perk } from '@thxnetwork/types/index';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { track } from '@thxnetwork/mixpanel';

export type RewardByPage = {
    [page: number]: TERC20Perk[];
};

export type TERC20PerkState = {
    [poolId: string]: {
        [id: string]: TERC20Perk & { erc20: TERC20 };
    };
};

export type RewardListProps = {
    pool: TPool;
    page: number;
    limit: number;
};

type TERC20PerkInputData = TERC20Perk & {
    file?: any;
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
    set({ pool, reward }: { reward: TERC20Perk & { _id: string }; pool: TPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TERC20Perk) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }: RewardListProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc20-perks',
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
    async create({ pool, payload }: { pool: TPool; payload: TERC20PerkInputData }) {
        const formData = prepareFormDataForUpload(payload);
        const { data } = await axios({
            method: 'POST',
            url: '/erc20-perks',
            headers: { 'X-PoolId': pool._id },
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'coin perk']);

        this.context.commit('set', { pool, reward: { ...payload, ...data } });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: TPool; reward: TERC20Perk; payload: TERC20PerkInputData }) {
        const formData = prepareFormDataForUpload(payload);
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc20-perks/${reward._id}`,
            headers: { 'X-PoolId': pool._id },
            data: formData,
        });

        this.context.commit('set', {
            pool: pool,
            reward: { ...reward, ...data },
        });
    }

    @Action({ rawError: true })
    async delete(reward: TERC20Perk) {
        await axios({
            method: 'DELETE',
            url: `/erc20-perks/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default ERC20PerkModule;
