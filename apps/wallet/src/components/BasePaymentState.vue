<template>
  <div class="flex-grow-1 center-center">
    <div class="text-center" v-if="payment.state === PaymentState.Pending">
      <b-spinner variant="gray" class="mb-2" />
      <p class="text-gray">Payment is being processed</p>
    </div>
    <div class="text-center" v-if="payment.state === PaymentState.Completed">
      <i class="fas fa-thumbs-up text-success mb-3" style="font-size: 3rem"></i>
      <p class="text-gray">
        <strong>THX!</strong> This payment has been completed.
      </p>
      <div class="d-flex justify-content-between" v-if="payment.metadata">
        <div>
          <p class="text-gray">The <strong>NFT</strong> has been minted</p>
        </div>
        <div class="text-gray">
          {{ payment.metadata.title || 'No Title' }}
        </div>
        <div class="text-gray">
          <b-badge :key="key" v-for="(key, value) in payment.metadata.attributes" variant="dark" v-b-tooltip
            :title="key" class="mr-2 text-gray">
            {{ value }}
          </b-badge>
        </div>
      </div>
      <b-button class="rounded-pill" variant="primary" :href="payment.successUrl">
        Continue to merchant
        <i class="fas fa-chevron-right ml-2"></i>
      </b-button>
    </div>
    <div class="text-center" v-if="payment.state === PaymentState.Failed">
      <i class="fas fa-exclamation-circle text-danger mb-3" style="font-size: 3rem"></i>
      <p class="text-gray">Your payment has not been processed.</p>
      <b-button class="rounded-pill" variant="primary" :href="payment.failUrl">
        <i class="fas fa-chevron-left mr-2"></i>
        Back to merchant
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { PaymentState } from '@thxnetwork/wallet/types/Payments';
import type { TPayment } from '@thxnetwork/wallet/types/Payments';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class BasePaymentState extends Vue {
  PaymentState = PaymentState;

  @Prop() payment!: TPayment;

  mounted() {
    if (
      this.payment.state == PaymentState.Completed &&
      this.payment.promotion &&
      this.payment.membership
    ) {
      this.$router.push({
        path: `/memberships/${this.payment.membership._id}/promotions`,
      });
    }
  }
}
</script>
