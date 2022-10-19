<template>
  <b-modal
    title="Connect payment account"
    id="modalPaymentConnect"
    body-bg-variant="light"
    no-close-on-backdrop
    no-close-on-esc
    centered
    scrollable
    hide-footer
    hide-header
    hide-header-close
  >
    <b-form-group>
      <b-form-radio @change="signin()">
        <strong class="text-primary">E-mail + Password</strong>
        <p>
          Use a traditional e-mail and password combination to authenticate for
          this payment.
        </p>
      </b-form-radio>
      <b-form-radio @change="signin()">
        <strong class="text-primary">Social Sign-in</strong>
        <p>
          Use one of our integrated SSO providers to authenticate for for this
          payment.
        </p>
      </b-form-radio>
      <b-form-radio @change="signin()" class="mb-0">
        <strong class="text-primary">
          Metamask <b-badge variant="primary">Beta</b-badge>
        </strong>
        <p>Use a Metamask account to authenticate for this payment.</p>
      </b-form-radio>
    </b-form-group>
    <small class="text-muted" v-if="payment">
      A small MATIC fee does apply when you need to approve us to do the
      transfer. You only have to do this once for the
      {{ payment.tokenSymbol }} token.
    </small>
  </b-modal>
</template>
<script lang="ts">
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import type { TPayment } from '@thxnetwork/wallet/types/Payments';
import { User } from 'oidc-client-ts';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
  computed: mapGetters({
    user: 'accounts/user',
  }),
})
export default class Payment extends Vue {
  @Prop() chainId!: ChainId;
  @Prop() payment!: TPayment;
  @Prop() isConnected!: boolean;

  user!: User;

  async signin() {
    const toPath = window.location.href.substring(
      window.location.origin.length
    );
    this.$store.dispatch('account/signinRedirect', { toPath });
  }

  async connect() {
    await this.$store.dispatch('network/connect', this.payment.chainId);

    if (this.chainId !== this.payment.chainId) {
      await this.$store.dispatch(
        'network/requestSwitchNetwork',
        this.payment.chainId
      );
    }

    this.$emit('connected');
    this.$bvModal.hide('modalPaymentConnect');
  }
}
</script>
