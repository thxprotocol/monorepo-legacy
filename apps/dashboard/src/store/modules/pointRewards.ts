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

    @Mutation
    unset(reward: TPointReward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    set(reward: TPointReward) {
        if (!this._all[reward.poolId]) Vue.set(this._all, reward.poolId, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data

        reward.variant = questInteractionVariantMap[reward.interaction];
        reward.contentMetadata = reward.contentMetadata ? JSON.parse(reward.contentMetadata) : '';

        Vue.set(this._all[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        this._totals[pool._id] = total;
    }

    @Action({ rawError: true })
    async list({ page, limit, pool }: { page: number; limit: number; pool: TPool }) {
        const { data } = await axios({
            method: 'GET',
            url: '/point-rewards',
            headers: { 'X-PoolId': pool._id },
            params: { page, limit },
        });
        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((reward: TPointReward) => {
            reward.page = page;
            reward.update = (payload: TBaseReward) => this.context.dispatch('update', payload);
            this.context.commit('set', reward);
        });
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

        this.context.commit('set', { ...quest, ...r.data });
    }

    @Action({ rawError: true })
    async update(quest: TPointReward) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/point-rewards/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });
        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: TPointReward) {
        await axios({
            method: 'DELETE',
            url: `/point-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default PointRewardModule;
