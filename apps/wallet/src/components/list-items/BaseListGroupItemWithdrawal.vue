<template>
  <b-list-group-item class="d-flex align-items-center w-100">
    <base-popover-transactions
      :transactions="withdrawal.transactions"
      :target="`popover-target-${withdrawal._id}`"
    />
    <div
      :id="`popover-target-${withdrawal._id}`"
      class="mr-3"
      :class="{
        'text-muted': !withdrawal.withdrawalId && !withdrawal.failReason,
        'text-primary': withdrawal.withdrawalId,
      }"
    >
      <i
        :class="{
          far: withdrawal.state === WithdrawalState.Pending,
          fas: withdrawal.state === WithdrawalState.Withdrawn,
        }"
        class="fa-check-circle"
      >
      </i>
    </div>
    <div class="mr-auto line-height-12">
      <strong class="font-weight-bold">
        {{ withdrawal.amount }}
        {{ erc20.symbol }}
        <i
          v-if="withdrawal.type === WithdrawalType.ClaimReward"
          v-b-tooltip.hover
          title="You have claimed this reward yourself."
          class="text-muted fas fa-gift"
        ></i>
        <i
          v-if="withdrawal.type === WithdrawalType.ClaimRewardFor"
          v-b-tooltip.hover
          title="You have been given this reward."
          class="text-muted fas fa-award"
        ></i>
        <i
          v-if="withdrawal.type === WithdrawalType.ProposeWithdrawal"
          v-b-tooltip.hover
          title="You have been given this amount of tokens."
          class="text-muted fas fa-coins"
        ></i>
      </strong>

      <br />
      <span class="text-muted small" v-if="withdrawal.createdAt">
        Last update:
        {{ format(new Date(withdrawal.updatedAt), 'HH:mm MMMM dd, yyyy') }}
      </span>
    </div>
    <b-button
      variant="primary"
      :disabled="
        withdrawal.state === 1 || !withdrawal.withdrawalId || error || busy
      "
      @click="withdraw()"
    >
      Withdraw
    </b-button>
    <b-button
      hover-class="text-danger"
      class="ml-3"
      variant="light"
      :disabled="busy"
      @click="remove()"
    >
      <i class="fas fa-trash m-0"></i>
    </b-button>
  </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TMembership } from '@thxnetwork/wallet/store/modules/memberships';
import {
  Withdrawal,
  WithdrawalState,
  WithdrawalType,
} from '@thxnetwork/wallet/store/modules/withdrawals';
import { format } from 'date-fns';
import { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import BasePopoverTransactions from '@thxnetwork/wallet/components/popovers/BasePopoverTransactions.vue';
import {
  TransactionState,
  TTransaction,
} from '@thxnetwork/wallet/types/Transactions';
import poll from 'promise-poller';

@Component({
  components: {
    BasePopoverTransactions,
  },
})
export default class BaseListGroupItemWithdrawal extends Vue {
  WithdrawalType = WithdrawalType;
  WithdrawalState = WithdrawalState;
  busy = false;
  error = '';
  format = format;

  @Prop() erc20!: TERC20;
  @Prop() withdrawal!: Withdrawal;
  @Prop() membership!: TMembership;

  get pendingTransactions() {
    return this.withdrawal.transactions.filter((tx: TTransaction) =>
      [TransactionState.Scheduled, TransactionState.Sent].includes(tx.state)
    );
  }

  mounted() {
    // If there are Scheduled or Sent transactions that should get a status change soon, start polling
    if (this.pendingTransactions.length) {
      this.busy = true;
      this.waitForTransactionMined();
    }
  }

  waitForTransactionMined() {
    const taskFn = async () => {
      const tx = await this.$store.dispatch(
        'transactions/read',
        this.pendingTransactions[0]._id
      );

      switch (tx.state) {
        case TransactionState.Mined: {
          await this.$store.dispatch('withdrawals/read', {
            membership: this.membership,
            id: this.withdrawal._id,
          });
          this.busy = false;
          return Promise.resolve(tx);
        }
        case TransactionState.Failed:
        case TransactionState.Scheduled:
        case TransactionState.Sent:
          return Promise.reject(tx);
      }
    };

    poll({ taskFn, interval: 1500, retries: 50 });
  }

  async remove() {
    this.busy = true;
    await this.$store.dispatch('withdrawals/remove', {
      membership: this.membership,
      withdrawal: this.withdrawal,
    });
    this.busy = false;
  }

  async withdraw() {
    this.busy = true;
    await this.$store.dispatch('withdrawals/withdraw', {
      membership: this.membership,
      id: this.withdrawal._id,
    });
    this.waitForTransactionMined();
  }
}
</script>
