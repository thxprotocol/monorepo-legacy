import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import type { TPointReward } from '@thxnetwork/types/interfaces';
import { track } from '@thxnetwork/mixpanel';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

@Module({ namespaced: true })
class PointRewardModule extends VuexModule {
    @Action({ rawError: true })
    async create(quest: TPointReward) {
        await axios({
            method: 'POST',
            url: '/point-rewards',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'conditional reward']);
    }

    @Action({ rawError: true })
    async update(quest: TPointReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/point-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });
        this.context.commit('pools/setQuest', { ...data }, { root: true });
    }

    @Action({ rawError: true })
    async delete(reward: TPointReward) {
        await axios({
            method: 'DELETE',
            url: `/point-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('pools/unsetQuest', reward, { root: true });
    }
}

export default PointRewardModule;
