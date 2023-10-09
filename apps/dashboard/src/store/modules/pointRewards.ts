import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { TPool, TBaseReward, TPointReward } from '@thxnetwork/types/interfaces';
import { RewardConditionPlatform } from '@thxnetwork/types/enums';
import { questInteractionVariantMap } from '@thxnetwork/types/maps';
import {} from '@thxnetwork/types/index';
import { track } from '@thxnetwork/mixpanel';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

export type TPointRewardState = {
    [poolId: string]: {
        [id: string]: TPointReward;
    };
};

@Module({ namespaced: true })
class PointRewardModule extends VuexModule {
    _all: TPointRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Action({ rawError: true })
    async create(quest: TPointReward) {
        const r = await axios({
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
        await axios({
            method: 'PATCH',
            url: `/point-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });
    }

    @Action({ rawError: true })
    async delete(reward: TPointReward) {
        await axios({
            method: 'DELETE',
            url: `/point-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
    }
}

export default PointRewardModule;
