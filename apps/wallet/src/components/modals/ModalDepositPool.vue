<template>
  <b-modal
    v-if="membership"
    :id="`modalDepositPool-${membership._id}`"
    @show="onShow()"
    centered
    scrollable
    title="Pool Deposit"
  >
    <div class="w-100 text-center" v-if="busy">
      <b-spinner variant="dark" />
    </div>
    <template v-if="!busy && erc20">
      <b-alert show variant="danger" v-if="error">
        {{ error }}
      </b-alert>
      <b-alert :show="hasInsufficientBalance" variant="warning">
        You do not have enough {{ erc20.symbol }} on this account.
      </b-alert>
      <b-alert :show="hasInsufficientMATICBalance" variant="warning">
        A balance of <strong>{{ maticBalance }} MATIC</strong> is not enough to
        pay for gas.
      </b-alert>
      <form @submit.prevent="deposit()" id="formAmount">
        <b-form-input autofocus size="lg" v-model="amount" type="number" />
      </form>
      <p class="small text-muted mt-2 mb-0">
        Your balance: <strong>{{ erc20.balance }} {{ erc20.symbol }}</strong> (
        <b-link @click="amount = erc20.balance"> Set Max </b-link>
        )
      </p>
    </template>
    <template v-slot:modal-footer>
      <b-button
        :disabled="hasInsufficientBalance"
        class="mt-3 btn-rounded"
        block
        variant="primary"
        form="formAmount"
        type="submit"
      >
        Deposit
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import type { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import type { TMembership } from '@thxnetwork/wallet/store/modules/memberships';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
import { fromWei, toWei } from 'web3-utils';

@Component({
  computed: {
    ...mapState('network', ['web3', 'privateKey']),
    ...mapState({
      contracts: (state: any) => state.erc20.contracts,
      tokens: (state: any) => state.erc20.contracts,
    }),
    ...mapGetters({
      profile: 'account/profile',
    }),
  },
})
export default class BaseModalDepositPool extends Vue {
  busy = false;
  error = '';
  allowance = 0;
  amount = '0';
  maticBalance = 0;

  // getters
  profile!: UserProfile;
  contracts!: { [id: string]: TERC20 };
  web3!: Web3;
  privateKey!: string;

  @Prop() membership!: TMembership;

  get erc20() {
    return this.contracts[this.membership.erc20Id];
  }

  get hasInsufficientBalance() {
    return Number(this.erc20.balance) < Number(this.amount);
  }

  get hasInsufficientMATICBalance() {
    return this.maticBalance == 0;
  }

  async onShow() {
    this.maticBalance = Number(
      fromWei(await this.web3.eth.getBalance(this.profile.address))
    );
    this.$store.dispatch('erc20/balanceOf', this.erc20);
  }

  onInput() {
    this.amount = toWei(this.amount);
  }

  async deposit() {
    this.busy = true;
    const amountInInWei = toWei(this.amount);
    const allowance = await this.$store.dispatch('erc20/allowance', {
      contract: this.erc20.contract,
      owner: this.profile.address,
      spender: this.membership.poolAddress,
    });
    this.allowance = Number(allowance);

    if (this.allowance < Number(amountInInWei)) {
      await this.$store.dispatch('erc20/approve', {
        contract: this.erc20.contract,
        to: this.membership.poolAddress,
        amount: amountInInWei,
        poolId: this.membership.poolId,
      });
    }
    await this.$store.dispatch('deposits/create', {
      membership: this.membership,
      amount: amountInInWei,
    });
    this.$store.dispatch('memberships/get', this.membership._id);
    this.$bvModal.hide(`modalDepositPool-${this.membership._id}`);
    this.busy = false;
  }
}
</script>
