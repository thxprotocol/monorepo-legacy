import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { type TPool } from '@thxnetwork/types/index';
import { type TReferralReward } from '@thxnetwork/types/index';
import { track } from '@thxnetwork/mixpanel';

export type RewardByPage = {
    [page: number]: TReferralReward[];
};

export type TRewardState = {
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
    _all: TRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TReferralReward & { _id: string }; pool: TPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TReferralReward) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        this._totals[pool._id] = total;
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }: RewardListProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/referral-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });
        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((reward: TReferralReward) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: TPool; payload: TReferralReward }) {
        const { data } = await axios({
            method: 'POST',
            url: '/referral-rewards',
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'referral reward']);

        data.page = 1;
        this.context.commit('set', { pool, reward: data });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: TPool; reward: TReferralReward; payload: TReferralReward }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/referral-rewards/${reward._id}`,
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });
        this.context.commit('set', {
            pool,
            reward: { ...reward, ...data },
        });
    }

    @Action({ rawError: true })
    async delete(reward: TReferralReward) {
        await axios({
            method: 'DELETE',
            url: `/referral-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default ReferralRewardModule;
