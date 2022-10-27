<template>
  <b-modal
    v-if="membership && swapRule"
    :id="`modalERC20Swap-${swapRule._id}`"
    @show="onShow()"
    centered
    scrollable
    title="Swap"
  >
    <div class="w-100 text-center" v-if="busy">
      <b-spinner variant="dark" />
    </div>
    <template v-if="!busy && tokenIn">
      <b-alert show variant="danger" v-if="error">
        {{ error }}
      </b-alert>
      <b-alert :show="hasInsufficientBalance" variant="warning">
        You do not have enough {{ tokenIn.symbol }} on this account.
      </b-alert>
      <b-alert :show="hasInsufficientMATICBalance" variant="warning">
        A balance of <strong>{{ maticBalance }} MATIC</strong> is not enough to
        pay for gas.
      </b-alert>
      <form @submit.prevent="swap()" id="formAmount">
        <b-form-input
          autofocus
          size="lg"
          v-model="amount"
          type="number"
          @input="onTokenInAmountChange()"
        />
      </form>
      <p class="small text-muted mt-2 mb-0">
        Your balance:
        <strong>{{ tokenIn.balance }} {{ tokenIn.symbol }}</strong> (
        <b-link @click="amount = Number(tokenIn.balance)"> Set Max </b-link>
        ) <br />
        You receive:
        <strong>{{ tokenInPrevisionedAmount }} {{ tokenOut.symbol }}</strong>
      </p>
    </template>
    <template v-slot:modal-footer>
      <b-button
        :disabled="hasInsufficientBalance || amount <= 0"
        class="mt-3 btn-rounded"
        block
        variant="primary"
        form="formAmount"
        type="submit"
      >
        Swap
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import type { IERC20s } from '@thxnetwork/wallet/store/modules/erc20';
import type { TMembership } from '@thxnetwork/wallet/store/modules/memberships';
import type { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import type { TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
import { toWei } from 'web3-utils';

@Component({
  computed: {
    ...mapState('erc20', ['contracts']),
    ...mapState('network', ['address', 'web3']),
    ...mapGetters({
      profile: 'account/profile',
      privateKey: 'account/privateKey',
    }),
  },
})
export default class BaseModalERC20Swap extends Vue {
  busy = false;
  error = '';
  balance = 0;
  allowance = 0;
  amount = 0;
  maticBalance = '0';
  tokenInPrevisionedAmount = 0;

  // getters
  web3!: Web3;
  address!: string;
  networks!: TNetworks;
  contracts!: IERC20s;

  @Prop() membership!: TMembership;
  @Prop() swapRule!: TSwapRule;

  get tokenOut() {
    return this.contracts[this.membership.erc20Id];
  }

  get tokenIn() {
    return this.contracts[this.swapRule.tokenInId];
  }

  get hasInsufficientBalance() {
    return Number(this.tokenIn.balance) < this.amount;
  }

  get hasInsufficientMATICBalance() {
    return (
      this.membership.chainId !== ChainId.Hardhat && this.maticBalance === '0'
    );
  }

  async onShow() {
    this.maticBalance = await this.web3.eth.getBalance(this.address);
    await this.$store.dispatch('erc20/balanceOf', this.tokenIn);
  }

  onTokenInAmountChange() {
    this.tokenInPrevisionedAmount =
      this.amount > 0 ? this.amount * this.swapRule.tokenMultiplier : 0;
  }

  async swap() {
    this.busy = true;

    const allowance = await this.$store.dispatch('erc20/allowance', {
      contract: this.tokenIn.contract,
      owner: this.address,
      spender: this.membership.poolAddress,
    });
    this.allowance = Number(allowance);

    const amountInInWei = toWei(String(this.amount));
    if (this.allowance < Number(amountInInWei)) {
      await this.$store.dispatch('erc20/approve', {
        contract: this.tokenIn.contract,
        to: this.membership.poolAddress,
        poolId: this.membership.poolId,
        amount: amountInInWei,
      });
    }

    await this.$store.dispatch('swaps/create', {
      membership: this.membership,
      swapRule: this.swapRule,
      amountInInWei,
      tokenInAddress: this.tokenIn.address,
    });

    this.$bvModal.hide(`modalERC20Swap-${this.swapRule._id}`);
    this.busy = false;
  }
}
</script>
