import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardConditionPlatform, type TDailyReward } from '@thxnetwork/types/index';
import { IPool } from './pools';
import { track } from '@thxnetwork/mixpanel';

export type TMerchantState = {
    [poolId: string]: {
        [id: string]: TMerchant;
    };
};

@Module({ namespaced: true })
class DailyRewardModule extends VuexModule {
    _all: TMerchantState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    unset(reward: TDailyReward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    set(reward: TDailyReward) {
        if (!this._all[reward.poolId]) Vue.set(this._all, reward.poolId, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Action({ rawError: true })
    async list({ page, pool }: { page: number; pool: IPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/daily-rewards',
            headers: { 'X-PoolId': pool._id },
        });

        data.results.forEach((reward: TDailyReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(payload: TDailyReward) {
        const r = await axios({
            method: 'POST',
            url: '/merchants',
            data: payload,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'conditional reward']);

        this.context.commit('set', { ...payload, ...r.data });
    }

    @Action({ rawError: true })
    async update(reward: TDailyReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/daily-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: reward,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TDailyReward) {
        await axios({
            method: 'DELETE',
            url: `/daily-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default DailyRewardModule;
