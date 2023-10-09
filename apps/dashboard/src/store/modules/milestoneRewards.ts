import axios from 'axios';
import { type TMilestoneReward } from '@thxnetwork/types/index';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

export type TMilestoneRewardState = {
    [poolId: string]: {
        [id: string]: TMilestoneReward;
    };
};

@Module({ namespaced: true })
class MilestoneRewardModule extends VuexModule {
    @Action({ rawError: true })
    async create(quest: TMilestoneReward) {
        const { data } = await axios({
            method: 'POST',
            url: '/milestone-rewards',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });
        this.context.commit('pools/setQuest', { ...data }, { root: true });
    }

    @Action({ rawError: true })
    async update(quest: TMilestoneReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/milestone-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });
        this.context.commit('pools/setQuest', { ...data }, { root: true });
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
