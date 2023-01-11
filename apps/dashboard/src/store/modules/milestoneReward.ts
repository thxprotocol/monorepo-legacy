import { RewardConditionPlatform, TMilestoneReward } from '@thxnetwork/types';
import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { IPool } from './pools';

export type TMilestoneRewardState = {
    [poolId: string]: {
        [id: string]: TMilestoneReward;
    };
};

@Module({ namespaced: true })
class MilestoneRewardModule extends VuexModule {
    _all: TMilestoneRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    unset(reward: TMilestoneReward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    set(reward: TMilestoneReward) {
        if (!this._all[reward.poolId]) Vue.set(this._all, reward.poolId, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Action({ rawError: true })
    async list({ page, pool }: { page: number; pool: IPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/milestone-rewards',
            headers: { 'X-PoolId': pool._id },
        });

        data.results.forEach((reward: TMilestoneReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(payload: TMilestoneReward) {
        const r = await axios({
            method: 'POST',
            url: '/milestone-rewards',
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });

        this.context.commit('set', { ...payload, ...r.data });
    }

    @Action({ rawError: true })
    async update(reward: TMilestoneReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/milestone-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: reward,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TMilestoneReward) {
        await axios({
            method: 'DELETE',
            url: `/milestone-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default MilestoneRewardModule;
