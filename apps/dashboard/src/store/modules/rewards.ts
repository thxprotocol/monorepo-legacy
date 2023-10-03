import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardVariant } from '@thxnetwork/types/enums';
import type { TCustomReward, TWebhook, TPool } from '@thxnetwork/types/interfaces';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';
import {} from '@thxnetwork/types/interfaces/CustomReward';

export type TCustomRewardState = {
    [poolId: string]: {
        [id: string]: TCustomReward & { webhook: TWebhook };
    };
};

@Module({ namespaced: true })
class CustomRewardModule extends VuexModule {
    _customRewards: TCustomRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._customRewards;
    }

    @Mutation
    set(reward: TCustomReward) {
        if (!this._customRewards[reward.poolId]) Vue.set(this._customRewards, reward.poolId, {});
        reward.variant = RewardVariant.Custom;
        Vue.set(this._customRewards[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    unset(reward: TCustomReward) {
        Vue.delete(this._customRewards[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }) {
        const { data } = await axios({
            method: 'GET',
            url: '/custom-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TCustomReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(reward: TCustomReward) {
        const formData = prepareFormDataForUpload(reward);
        const { data } = await axios({
            method: 'POST',
            url: '/custom-rewards',
            headers: { 'X-PoolId': reward.poolId },
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'custom reward']);

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async update(reward: TCustomReward) {
        const formData = prepareFormDataForUpload(reward);
        const { data } = await axios({
            method: 'PATCH',
            url: `/custom-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: formData,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TCustomReward) {
        await axios({
            method: 'DELETE',
            url: `/custom-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default CustomRewardModule;
