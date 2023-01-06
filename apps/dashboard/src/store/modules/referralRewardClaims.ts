import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from './pools';
import { TReferralReward, type TReferralRewardClaim } from '@thxnetwork/types/index';

export type RewardByPage = {
    [page: number]: TReferralRewardClaim[];
};

export type TRewardClaimState = {
    [poolId: string]: {
        [id: string]: TReferralRewardClaimAccount;
    };
};

export type RewardListProps = {
    pool: IPool;
    page: number;
    limit: number;
};

export type TReferralRewardClaimAccount = TReferralRewardClaim & {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    page: number;
};

@Module({ namespaced: true })
class ReferralRewardModule extends VuexModule {
    _all: TRewardClaimState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, claim }: { pool: IPool; claim: TReferralRewardClaimAccount }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], claim._id, claim);
    }

    @Mutation
    unset(claim: TReferralRewardClaimAccount, pool: IPool) {
        Vue.delete(this._all[pool._id], claim._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: IPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list(payload: { pool: IPool; reward: TReferralReward; page: number; limit: number }) {
        const { data } = await axios({
            method: 'GET',
            url: `/referral-rewards/${payload.reward.uuid}/claims`,
            headers: { 'X-PoolId': payload.pool._id },
            params: {
                page: String(payload.page),
                limit: String(payload.limit),
            },
        });
        this.context.commit('setTotal', { pool: payload.pool, total: data.total });

        data.results.forEach((claim: TReferralRewardClaimAccount) => {
            claim.page = payload.page;
            this.context.commit('set', { pool: payload.pool, claim });
        });
    }

    @Action({ rawError: true })
    async approveMany({
        pool,
        reward,
        claims,
    }: {
        pool: IPool;
        reward: TReferralReward;
        claims: TReferralRewardClaimAccount[];
        page: number;
    }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/referral-rewards/${reward.uuid}/claims`,
            headers: { 'X-PoolId': pool._id },
            data: { claimUuids: claims.map((x) => x.uuid) },
        });

        data.forEach((claim: TReferralRewardClaimAccount) => {
            this.context.commit('set', { pool: pool, claim });
        });
    }

    @Action({ rawError: true })
    async update({
        pool,
        reward,
        claim,
        payload,
    }: {
        pool: IPool;
        reward: TReferralReward;
        claim: TReferralRewardClaimAccount;
        payload: TReferralRewardClaim;
    }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/referral-rewards/${reward.uuid}/claims/${claim.uuid}`,
            headers: { 'X-PoolId': pool._id },
            data: payload,
        });
        this.context.commit('set', {
            pool,
            claim: { ...claim, ...data },
        });
    }
}

export default ReferralRewardModule;
