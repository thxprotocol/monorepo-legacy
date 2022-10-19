<template>
  <b-modal
    @show="onShow"
    :id="`modalTransferTokens-${erc20._id}`"
    centered
    scrollable
    title="Transfer tokens"
  >
    <div class="w-100 text-center" v-if="busy">
      <b-spinner variant="dark" />
    </div>
    <template v-else>
      <p>Transfer tokens from your THX Web Wallet to another wallet address.</p>
      <b-alert variant="info" show v-if="balance <= 0.01">
        <i class="fas fa-info-circle mr-1"></i>
        You hold <strong>{{ balance }} MATIC</strong> which is less than the
        <strong>0.01 MATIC</strong> we suggest for this ERC20 transfer.
      </b-alert>
      <form @submit.prevent="transfer()" id="formTransfer">
        <b-form-group>
          <b-form-input
            autofocus
            size="lg"
            v-model="amount"
            type="number"
            placeholder="Amount to transfer"
          />
        </b-form-group>
        <b-form-group>
          <b-form-input
            size="lg"
            v-model="to"
            type="text"
            placeholder="Address of the receiver"
          />
        </b-form-group>
      </form>
    </template>
    <template v-slot:modal-footer>
      <b-button
        class="rounded-pill"
        block
        variant="primary"
        form="formTransfer"
        type="submit"
      >
        Transfer
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import type { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { toWei } from 'web3-utils';

@Component({
  computed: mapGetters({
    profile: 'account/profile',
  }),
})
export default class BaseModalTranferTokens extends Vue {
  busy = false;
  amount = '0';
  to = '';
  profile!: UserProfile;
  balance = 0;

  @Prop() erc20!: TERC20;

  async onShow() {
    this.balance = await this.$store.dispatch('network/getBalance');
  }

  async transfer() {
    this.busy = true;

    const allowance = this.$store.dispatch('erc20/allowance', {
      erc20: this.erc20,
      owner: this.profile.address,
      spender: this.to,
    });

    if (Number(allowance) < Number(this.amount)) {
      await this.$store.dispatch('erc20/approve', {
        contract: this.erc20.contract,
        to: this.to,
        amount: toWei(this.amount, 'ether'),
      });
    }

    await this.$store.dispatch('erc20/transfer', {
      erc20: this.erc20,
      to: this.to,
      amount: this.amount,
    });

    this.$store.dispatch('erc20/balanceOf', this.erc20);
    this.$bvModal.hide(`modalTransferTokens-${this.erc20._id}`);
    this.amount = '0';
    this.to = '';

    this.busy = false;
  }
}
</script>
