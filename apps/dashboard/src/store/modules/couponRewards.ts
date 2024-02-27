import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardVariant } from '@thxnetwork/common/enums';
import type { TRewardCoupon, TPool } from '@thxnetwork/types/interfaces';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';

export type TRewardCouponState = {
    [poolId: string]: {
        [id: string]: TRewardCoupon;
    };
};

@Module({ namespaced: true })
class CouponRewardModule extends VuexModule {
    _couponRewards: TRewardCouponState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._couponRewards;
    }

    @Mutation
    set(reward: TRewardCoupon) {
        if (!this._couponRewards[reward.poolId]) Vue.set(this._couponRewards, reward.poolId, {});
        reward.variant = RewardVariant.Coupon;
        Vue.set(this._couponRewards[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    unset(reward: TRewardCoupon) {
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

        data.results.forEach((reward: TRewardCoupon) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(reward: Partial<TRewardCoupon>) {
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
    async update(reward: Partial<TRewardCoupon>) {
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
    async delete(reward: Partial<TRewardCoupon>) {
        await axios({
            method: 'DELETE',
            url: `/coupon-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }

    @Action({ rawError: true })
    async deleteCode({ pool, reward, couponCodeId }: { pool: TPool; reward: TRewardCoupon; couponCodeId: string }) {
        await axios({
            method: 'DELETE',
            url: `/coupon-rewards/${reward._id}/codes/${couponCodeId}`,
            headers: { 'X-PoolId': pool._id },
        });
        const index = reward.couponCodes.findIndex((c) => c._id === couponCodeId);
        reward.couponCodes.splice(index, 1);
        this.context.commit('set', reward);
    }
}

export default CouponRewardModule;
