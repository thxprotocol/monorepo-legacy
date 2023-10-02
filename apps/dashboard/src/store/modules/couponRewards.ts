import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardVariant } from '@thxnetwork/types/enums';
import type { TCouponReward, TPool } from '@thxnetwork/types/interfaces';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';

export type TCouponRewardState = {
    [poolId: string]: {
        [id: string]: TCouponReward;
    };
};

@Module({ namespaced: true })
class CouponRewardModule extends VuexModule {
    _couponRewards: TCouponRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._couponRewards;
    }

    @Mutation
    set(reward: TCouponReward) {
        if (!this._couponRewards[reward.poolId]) Vue.set(this._couponRewards, reward.poolId, {});
        reward.variant = RewardVariant.Coupon;
        Vue.set(this._couponRewards[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    unset(reward: TCouponReward) {
        Vue.delete(this._couponRewards[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }) {
        const { data } = await axios({
            method: 'GET',
            url: '/coupon-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TCouponReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(reward: Partial<TCouponReward>) {
        const formData = prepareFormDataForUpload(reward);
        const { data } = await axios({
            method: 'POST',
            url: '/coupon-rewards',
            headers: { 'X-PoolId': reward.poolId },
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'coupon reward']);

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async update(reward: Partial<TCouponReward>) {
        const formData = prepareFormDataForUpload(reward);
        const { data } = await axios({
            method: 'PATCH',
            url: `/coupon-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: formData,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: Partial<TCouponReward>) {
        await axios({
            method: 'DELETE',
            url: `/coupon-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default CouponRewardModule;
