import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { TMembership } from './memberships';
import type { TTransaction } from '@thxnetwork/wallet/types/Transactions';
import { TERC20 } from './erc20';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

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
    erc20: TERC20;
    transactions: TTransaction[];
    type: WithdrawalType;
    unlockDate: Date;

    constructor(data: any, page: number) {
        this.transactions = data.transactions;
        this._id = data._id;
        this.erc20 = data.erc20;
        this.amount = data.amount;
        this.state = data.state;
        this.beneficiary = data.beneficiary;
        this.approved = data.approved;
        this.withdrawalId = data.withdrawalId;
        this.rewardId = data.rewardId;
        this.type = data.type;
        this.page = page;
        this.failReason = data.failReason;
        this.unlockDate = data.unlockDate;
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
    set({ withdrawal, membership }: { withdrawal: Withdrawal; membership: TMembership }) {
        if (!this._all[membership._id]) {
            Vue.set(this._all, membership._id, {});
        }
        Vue.set(this._all[membership._id], withdrawal._id, withdrawal);
    }

    @Mutation
    unset({ withdrawal, membership }: { withdrawal: Withdrawal; membership: TMembership }) {
        Vue.delete(this._all[membership._id], withdrawal._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async read({ membership, id }: { membership: TMembership; id: string }) {
        const data = await thxClient.withdrawals.read({ id, poolId: membership.poolId });
        this.context.commit('set', { withdrawal: data, membership: membership });
    }

    @Action({ rawError: true })
    async get({ poolId, id }: { poolId: string; id: string }) {
        const data = await thxClient.withdrawals.get({ poolId, id });
        return data;
    }

    @Action({ rawError: true })
    async withdraw({ membership, id }: { membership: TMembership; id: string }) {
        await thxClient.withdrawals.withdraw({ poolId: membership.poolId, id });
        await this.context.dispatch('read', { membership, id });
    }

    @Action({ rawError: true })
    async remove({ membership, withdrawal }: { membership: TMembership; withdrawal: Withdrawal }) {
        await thxClient.withdrawals.remove({ poolId: membership.poolId, id: withdrawal._id });
        this.context.commit('unset', { membership, withdrawal });
    }

    @Action({ rawError: true })
    async filter({
        membership,
        page = 1,
        limit = 10,
        state,
    }: {
        membership: TMembership;
        page: number;
        limit: number;
        state?: WithdrawalState;
    }) {
        const profile = this.context.rootGetters['account/profile'];
        const params = new URLSearchParams();
        params.append('member', profile.address);
        params.append('page', String(page));
        params.append('limit', String(limit));

        const data = await thxClient.withdrawals.filter({
            poolId: membership.poolId,
            page,
            limit,
            address: profile.address,
            state,
        });

        this.context.commit('clear');

        for (const withdrawal of data.results) {
            this.context.commit('set', { withdrawal: new Withdrawal(withdrawal, page), membership });
        }

        return { pagination: data };
    }
}

export default WithdrawalModule;
