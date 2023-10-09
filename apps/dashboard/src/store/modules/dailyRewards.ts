import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { QuestVariant, TBaseReward, type TDailyReward } from '@thxnetwork/types/index';
import { type TPool } from '@thxnetwork/types/index';
import { track } from '@thxnetwork/mixpanel';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

export type TDailyRewardState = {
    [poolId: string]: {
        [id: string]: TDailyReward;
    };
};

@Module({ namespaced: true })
class DailyRewardModule extends VuexModule {
    _all: TDailyRewardState = {};
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
        reward.variant = QuestVariant.Daily;
        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        this._totals[pool._id] = total;
    }

    @Action({ rawError: true })
    async list({ page, pool, limit }: { page: number; pool: TPool; limit: number }) {
        const { data } = await axios({
            method: 'GET',
            url: '/daily-rewards',
            headers: { 'X-PoolId': pool._id },
            params: { limit, page },
        });
        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((reward: TDailyReward) => {
            reward.page = page;
            reward.update = (payload: TBaseReward) => this.context.dispatch('update', payload);
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(quest: TDailyReward) {
        const { data } = await axios({
            method: 'POST',
            url: '/daily-rewards',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'conditional reward']);

        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async update(quest: TDailyReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/daily-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TDailyReward) {
        await axios({
            method: 'DELETE',
            url: `/daily-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('pools/unsetQuest', reward, { root: true });
    }
}

export default DailyRewardModule;
