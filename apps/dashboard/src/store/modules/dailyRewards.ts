import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { type TDailyReward } from '@thxnetwork/types/index';
import { track } from '@thxnetwork/mixpanel';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

@Module({ namespaced: true })
class DailyRewardModule extends VuexModule {
    @Action({ rawError: true })
    async create(quest: TDailyReward) {
        const data = prepareFormDataForUpload(quest);
        const response = await axios({
            method: 'POST',
            url: '/daily-rewards',
            headers: { 'X-PoolId': quest.poolId },
            data,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'conditional reward']);

        this.context.commit('pools/setQuest', response.data, { root: true });
    }

    @Action({ rawError: true })
    async update(quest: TDailyReward) {
        const data = prepareFormDataForUpload(quest);
        const response = await axios({
            method: 'PATCH',
            url: `/daily-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data,
        });

        this.context.commit('pools/setQuest', response.data, { root: true });
    }

    @Action({ rawError: true })
    async delete(quest: TDailyReward) {
        await axios({
            method: 'DELETE',
            url: `/daily-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
        });
        this.context.commit('pools/unsetQuest', quest, { root: true });
    }
}

export default DailyRewardModule;
