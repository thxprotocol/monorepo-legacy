import axios from 'axios';
import { track } from '@thxnetwork/mixpanel';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import type { TWeb3Quest } from '@thxnetwork/types/interfaces';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

@Module({ namespaced: true })
class Web3QuestModule extends VuexModule {
    @Action({ rawError: true })
    async create(quest: TWeb3Quest) {
        await axios({
            method: 'POST',
            url: '/web3-quests',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'conditional quest']);

        this.context.commit('pools/setQuest', quest, { root: true });
    }

    @Action({ rawError: true })
    async update(quest: TWeb3Quest) {
        await axios({
            method: 'PATCH',
            url: `/web3-quests/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        this.context.commit('pools/setQuest', quest, { root: true });
    }

    @Action({ rawError: true })
    async delete(quest: TWeb3Quest) {
        await axios({
            method: 'DELETE',
            url: `/web3-quests/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
        });
        this.context.commit('pools/unsetQuest', quest, { root: true });
    }
}

export default Web3QuestModule;
