import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { type TPool } from '@thxnetwork/types/index';
import type { TReferralReward } from '@thxnetwork/types/index';
import { track } from '@thxnetwork/mixpanel';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

export type RewardByPage = {
    [page: number]: TReferralReward[];
};

export type TReferralRewardState = {
    [poolId: string]: {
        [id: string]: TReferralReward;
    };
};

export type RewardListProps = {
    pool: TPool;
    page: number;
    limit: number;
};

@Module({ namespaced: true })
class ReferralRewardModule extends VuexModule {
    @Action({ rawError: true })
    async create(quest: TReferralReward) {
        const { data } = await axios({
            method: 'POST',
            url: '/referral-rewards',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'referral reward']);

        this.context.commit('pools/setQuest', { ...data }, { root: true });
    }

    @Action({ rawError: true })
    async update(quest: TReferralReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/referral-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        this.context.commit('pools/setQuest', { ...data }, { root: true });
    }

    @Action({ rawError: true })
    async delete(reward: TReferralReward) {
        await axios({
            method: 'DELETE',
            url: `/referral-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('pools/unsetQuest', reward, { root: true });
    }
}

export default ReferralRewardModule;
