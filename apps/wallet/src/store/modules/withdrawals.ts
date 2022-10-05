import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { TTransaction } from '@thxnetwork/wallet/types/Transactions';

import { Membership } from './memberships';

export enum WithdrawalState {
    Pending = 0,
    Withdrawn = 1,
}

export enum WithdrawalType {
    ClaimReward = 0,
    ClaimRewardFor = 1,
    ProposeWithdrawal = 2,
}

export class Withdrawal {
    _id: string;
    amount: string;
    beneficiary: string;
    state: number;
    approved: boolean;
    withdrawalId: number;
    rewardId?: number;
    failReason?: string;
    createdAt: string;
    updatedAt: string;
    page: number;
    transactions: TTransaction[];
    type: WithdrawalType;

    constructor(data: any, page: number) {
        this.transactions = data.transactions;
        this._id = data._id;
        this.amount = data.amount;
        this.state = data.state;
        this.beneficiary = data.beneficiary;
        this.approved = data.approved;
        this.withdrawalId = data.withdrawalId;
        this.rewardId = data.rewardId;
        this.type = data.type;
        this.page = page;
        this.failReason = data.failReason;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}

export interface IWithdrawals {
    [poolAddress: string]: {
        [withdrawalId: string]: Withdrawal;
    };
}

@Module({ namespaced: true })
class WithdrawalModule extends VuexModule {
    _all: IWithdrawals = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ withdrawal, membership }: { withdrawal: Withdrawal; membership: Membership }) {
        if (!this._all[membership._id]) {
            Vue.set(this._all, membership._id, {});
        }
        Vue.set(this._all[membership._id], withdrawal._id, withdrawal);
    }

    @Mutation
    unset({ withdrawal, membership }: { withdrawal: Withdrawal; membership: Membership }) {
        Vue.delete(this._all[membership._id], withdrawal._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async read({ membership, id }: { membership: Membership; id: string }) {
        const r = await axios({
            method: 'GET',
            url: '/withdrawals/' + id,
            headers: { 'X-PoolId': membership.poolId },
        });
        this.context.commit('set', { withdrawal: r.data, membership: membership });
    }

    @Action({ rawError: true })
    async withdraw({ membership, id }: { membership: Membership; id: string }) {
        await axios({
            method: 'POST',
            url: `/withdrawals/${id}/withdraw`,
            headers: {
                'X-PoolId': membership.poolId,
            },
        });
        await this.context.dispatch('read', { membership, id });
    }

    @Action({ rawError: true })
    async remove({ membership, withdrawal }: { membership: Membership; withdrawal: Withdrawal }) {
        await axios({
            method: 'DELETE',
            url: `/withdrawals/${withdrawal._id}`,
            headers: {
                'X-PoolId': membership.poolId,
            },
        });

        this.context.commit('unset', { membership, withdrawal });
    }

    @Action({ rawError: true })
    async filter({
        membership,
        page = 1,
        limit = 10,
        state,
    }: {
        membership: Membership;
        page: number;
        limit: number;
        state?: WithdrawalState;
    }) {
        const profile = this.context.rootGetters['account/profile'];
        const params = new URLSearchParams();
        params.append('member', profile.address);
        params.append('page', String(page));
        params.append('limit', String(limit));

        if (state === WithdrawalState.Pending || state === WithdrawalState.Withdrawn) {
            params.append('state', String(state));
        }

        const r = await axios({
            method: 'get',
            url: '/withdrawals',
            params,
            headers: { 'X-PoolId': membership.poolId },
        });

        this.context.commit('clear');

        for (const withdrawal of r.data.results) {
            this.context.commit('set', { withdrawal: new Withdrawal(withdrawal, page), membership });
        }

        return { pagination: r.data };
    }
}

export default WithdrawalModule;
