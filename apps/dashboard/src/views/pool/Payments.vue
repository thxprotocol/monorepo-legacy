<template>
  <div>
    <b-row class="mb-3">
      <b-col class="d-flex align-items-center">
        <h2 class="mb-0">Payments</h2>
      </b-col>
      <b-col class="d-flex justify-content-end">
        <b-button
          v-b-modal="'modalPaymentCreate'"
          class="rounded-pill"
          variant="primary"
        >
          <i class="fas fa-plus mr-2"></i>
          <span class="d-none d-md-inline">Create Payment Request</span>
        </b-button>
        <base-modal-payment-create :pool="pool" />
      </b-col>
    </b-row>
    <base-nothing-here
      v-if="paymentsForPool && !paymentsForPool.length"
      text-submit="Create a Payment Request"
      title="You have not requested a payment yet"
      description="Ask people to pay you with the configured pool token."
      @clicked="$bvModal.show('modalPaymentCreate')"
    />
    <b-card
      class="shadow-sm mb-2"
      v-else
      :key="payment.id"
      v-for="payment of paymentsForPool"
    >
      <b-row>
        <b-col md="12">
          <small
            class="float-md-right text-muted"
            v-b-tooltip
            :title="`Updated: ${payment.updatedAt}`"
          >
            {{ payment.createdAt }}
          </small>
          <div class="d-flex align-items-start">
            <strong class="h3 text-primary mr-2">
              {{ fromWei(payment.amount, 'ether') }} {{ pool.erc20.symbol }}
            </strong>
            <b-badge
              class="rounded-pill bg-light"
              :class="{ 'text-success': payment.state }"
              >{{ PaymentState[payment.state] }}</b-badge
            >
          </div>
        </b-col>
        <b-col md="4"> </b-col>
      </b-row>
      <hr />
      <b-row>
        <b-col md="6">
          <b-input-group size="sm">
            <b-form-input size="sm" :value="payment.paymentUrl" readonly />
            <template #append>
              <b-button variant="primary" v-clipboard:copy="payment.paymentUrl">
                <i class="fas fa-clipboard ml-0"></i>
              </b-button>
            </template>
          </b-input-group>
        </b-col>
        <b-col md="6" class="text-md-right">
          <b-button
            size="sm"
            v-b-tooltip
            :title="payment.successUrl"
            target="_blank"
            :href="payment.successUrl"
            variant="light"
            class="rounded-pill ml-md-2"
          >
            <i class="fas fa-check-circle text-success mr-2"></i>
            Success URL
          </b-button>
          <b-button
            size="sm"
            v-b-tooltip
            :title="payment.failUrl"
            target="_blank"
            :href="payment.failUrl"
            variant="light"
            class="rounded-pill ml-md-2"
          >
            <i class="fas fa-exclamation-circle text-danger mr-2"></i>
            Fail URL
          </b-button>
          <b-button
            size="sm"
            v-b-tooltip
            :title="payment.cancelUrl"
            target="_blank"
            :href="payment.cancelUrl"
            variant="light"
            class="rounded-pill ml-md-2"
          >
            <i class="fas fa-arrow-alt-circle-left text-gray mr-2"></i>
            Cancel URL
          </b-button>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPayments } from '@thxnetwork/dashboard/types/IPayments';
import BaseModalPaymentCreate from '@thxnetwork/dashboard/components/modals/BaseModalPaymentCreate.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { fromWei } from 'web3-utils';

enum PaymentState {
  Pending = 0,
  Completed = 1,
}

@Component({
  components: {
    BaseNothingHere,
    BaseModalPaymentCreate,
  },
  computed: mapGetters({
    pools: 'pools/all',
    payments: 'payments/all',
  }),
})
export default class Payments extends Vue {
  PaymentState = PaymentState;
  fromWei = fromWei;
  loading = false;
  pools!: IPools;
  payments!: IPayments;

  get pool() {
    return this.pools[this.$route.params.id];
  }

  get paymentsForPool() {
    if (!this.payments[this.$route.params.id]) return [];
    return Object.values(this.payments[this.$route.params.id]);
  }

  async mounted() {
    await this.$store.dispatch('payments/list', this.pool);
  }
}
</script>
