import axios from 'axios';
import { type TSurveyReward } from '@thxnetwork/types/index';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { type TPool } from '@thxnetwork/types/index';

export type TSurveyRewardState = {
    [poolId: string]: {
        [id: string]: TSurveyReward;
    };
};

@Module({ namespaced: true })
class SurveyRewardModule extends VuexModule {
    _all: TSurveyRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    unset(reward: TSurveyReward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    set(reward: TSurveyReward) {
        if (!this._all[reward.poolId]) Vue.set(this._all, reward.poolId, {});
        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Action({ rawError: true })
    async list({ page, pool }: { page: number; pool: TPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/survey-rewards',
            headers: { 'X-PoolId': pool._id },
        });

        data.results.forEach((reward: TSurveyReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(reward: TSurveyReward) {
        const { data } = await axios({
            method: 'POST',
            url: '/survey-rewards',
            headers: { 'X-PoolId': reward.poolId },
            data: reward,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async update(reward: TSurveyReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/survey-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: reward,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TSurveyReward) {
        await axios({
            method: 'DELETE',
            url: `/survey-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default SurveyRewardModule;
