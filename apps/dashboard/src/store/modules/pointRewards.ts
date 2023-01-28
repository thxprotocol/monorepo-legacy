import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardConditionPlatform, type TPointReward } from '@thxnetwork/types/index';
import { IPool } from './pools';
import { track } from '@thxnetwork/mixpanel';

export type TPointRewardState = {
    [poolId: string]: {
        [id: string]: TPointReward;
    };
};

@Module({ namespaced: true })
class PointRewardModule extends VuexModule {
    _all: TPointRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    unset(reward: TPointReward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    set(reward: TPointReward) {
        if (!this._all[reward.poolId]) Vue.set(this._all, reward.poolId, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Action({ rawError: true })
    async list({ page, pool }: { page: number; pool: IPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/point-rewards',
            headers: { 'X-PoolId': pool._id },
        });

        data.results.forEach((reward: TPointReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(payload: TPointReward) {
        const r = await axios({
            method: 'POST',
            url: '/point-rewards',
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'conditional reward']);

        this.context.commit('set', { ...payload, ...r.data });
    }

    @Action({ rawError: true })
    async update(reward: TPointReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/point-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: reward,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TPointReward) {
        await axios({
            method: 'DELETE',
            url: `/point-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default PointRewardModule;
