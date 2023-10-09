import axios from 'axios';
import { QuestVariant, TBaseReward, type TMilestoneReward } from '@thxnetwork/types/index';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { type TPool } from '@thxnetwork/types/index';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

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
        reward.variant = QuestVariant.Custom;
        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        this._totals[pool._id] = total;
    }

    @Action({ rawError: true })
    async list({ page, pool, limit }: { page: number; limit: number; pool: TPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/milestone-rewards',
            headers: { 'X-PoolId': pool._id },
            params: { page, limit },
        });
        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((reward: TMilestoneReward) => {
            reward.page = page;
            reward.update = (payload: TBaseReward) => this.context.dispatch('update', payload);
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(quest: TMilestoneReward) {
        const { data } = await axios({
            method: 'POST',
            url: '/milestone-rewards',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async update(quest: TMilestoneReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/milestone-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TMilestoneReward) {
        await axios({
            method: 'DELETE',
            url: `/milestone-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('pools/unsetQuest', reward, { root: true });
    }
}

export default MilestoneRewardModule;
