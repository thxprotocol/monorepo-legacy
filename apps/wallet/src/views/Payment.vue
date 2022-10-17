<template>
  <div>
    <div class="d-flex flex-column h-100">
      <template v-if="payment">
        <template v-if="payment.state === PaymentState.Requested">
          <div class="flex-grow-1">
            <div>
              <b-alert variant="danger" show v-if="error">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {{ error }}
              </b-alert>
              <b-alert variant="success" show>
                <i class="fas fa-info-circle mr-2"></i>
                The
                <strong v-b-tooltip :title="payment.receiver"
                  >{{ payment.tokenSymbol }} Pool</strong
                >
                has send you a payment request.
              </b-alert>
              <p class="text-left">
                <small class="text-muted">Receiver:</small><br />
                <b-badge
                  :href="`${chainInfo[payment.chainId].blockExplorer}/address/${
                    payment.receiver
                  }`"
                  target="_blank"
                  variant="primary"
                  class="rounded-pill"
                >
                  {{ payment.receiver }}
                  <i
                    v-b-tooltip
                    title="View details of this account on the block explorer"
                    class="fas fa-external-link-alt mx-1"
                  ></i>
                </b-badge>
              </p>
              <p class="text-left">
                <small class="text-muted">Connected:</small><br />
                <b-badge
                  @click="$bvModal.show('modalPaymentConnect')"
                  variant="primary"
                  class="rounded-pill cursor-pointer"
                  v-if="!address && !user"
                >
                  <i class="fas fa-exclamation-circle mx-1"></i>
                  Connect account
                </b-badge>
                <b-badge
                  :href="`${
                    chainInfo[payment.chainId].blockExplorer
                  }/address/${address}`"
                  target="_blank"
                  variant="primary"
                  class="rounded-pill"
                  v-if="address"
                >
                  {{ address }}
                  <i
                    v-b-tooltip
                    title="View details of this account on the block explorer"
                    class="fas fa-external-link-alt mx-1"
                  ></i>
                </b-badge>
              </p>
              <p class="text-left">
                <small class="text-muted">Balance:</small><br />
                <strong class="text-primary"
                  >{{ balance }} {{ payment.tokenSymbol }}</strong
                >
              </p>
              <p
                class="text-left"
                v-if="
                  payment.metadata &&
                  (payment.metadata.title || payment.metadata.description)
                "
              >
                <small class="text-muted">Nft</small><br />
                <strong class="text-primary"
                  >{{ payment.metadata.title }}
                  {{ payment.metadata.description }}</strong
                >
              </p>
              <p class="text-left" v-if="payment.promotion">
                <small class="text-muted">Promotion</small><br />
                <strong class="text-primary"
                  >{{ payment.promotion.title }}
                  {{ payment.promotion.description }}</strong
                >
              </p>
            </div>
          </div>
          <b-button
            :disabled="!user && !address"
            @click="pay()"
            variant="primary"
            block
            class="rounded-pill mb-1"
          >
            Pay
            <strong>
              {{ fromWei(payment.amount, 'ether') }} {{ payment.tokenSymbol }}
            </strong>
          </b-button>
          <p class="text-muted text-center small m-0">
            <i class="fas fa-lock mr-1"></i>
            You only approve for the requested payment and transfers are
            securely relayed through our relay service.
          </p>
        </template>
        <base-payment-state :payment="payment" />
      </template>
      <div
        class="flex-grow-1 d-flex align-items-center justify-content-center"
        v-else
      >
        <b-spinner variant="primary" />
      </div>
    </div>
    <base-modal-payment-connect
      :chain-id="chainId"
      :payment="payment"
      @connected="onConnected"
    />
  </div>
</template>

<script lang="ts">
import { PaymentState, TPayment } from '@thxnetwork/wallet/types/Payments';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { fromWei } from 'web3-utils';
import BaseModalPaymentConnect from '@thxnetwork/wallet/components/modals/ModalPaymentConnect.vue';
import promisePoller from 'promise-poller';
import { default as ERC20Abi } from '@thxnetwork/contracts/exports/abis/LimitedSupplyToken.json';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import Web3 from 'web3';
import BasePaymentState from '@thxnetwork/wallet/components/BasePaymentState.vue';
import { User } from 'oidc-client-ts';

@Component({
  components: {
    BasePaymentState,
    BaseModalPaymentConnect,
  },
  computed: {
    ...mapState('payments', ['payment']),
    ...mapState('network', ['web3', 'address']),
    ...mapGetters({
      chainId: 'network/chainId',
      user: 'account/user',
    }),
  },
})
export default class Payment extends Vue {
  PaymentState = PaymentState;
  chainInfo = chainInfo;

  user!: User;
  address!: string;
  chainId!: ChainId;
  web3!: Web3;
  payment!: TPayment;

  error = '';
  loading = false;
  fromWei = fromWei;
  balanceInWei = '';

  get balance() {
    return fromWei(this.balanceInWei);
  }

  get contract() {
    return new this.web3.eth.Contract(
      ERC20Abi as any,
      this.payment.tokenAddress,
      { from: this.address }
    );
  }

  created() {
    this.$store
      .dispatch('payments/read', {
        paymentId: this.$route.params.id,
        accessToken: this.$route.query.accessToken,
      })
      .then(async () => {
        if (this.payment.state === PaymentState.Pending)
          return this.waitForPaymentCompleted();
        if (this.payment.state !== PaymentState.Requested) return;

        if (!this.user && !this.address) {
          return this.$bvModal.show('modalPaymentConnect');
        }

        await this.$store.dispatch('network/connect', this.payment.chainId);
        this.getBalance();
      });
  }

  onConnected() {
    this.getBalance();
  }

  async getBalance() {
    const address = this.user ? this.user.profile.address : this.address;
    this.balanceInWei = await this.contract.methods.balanceOf(address).call();
  }

  waitForPaymentCompleted() {
    const taskFn = async () => {
      const payment = await this.$store.dispatch('payments/read', {
        paymentId: this.payment.id,
        accessToken: this.payment.token,
      });

      switch (payment.state) {
        case PaymentState.Completed:
        case PaymentState.Failed:
        case PaymentState.Requested: {
          this.loading = false;
          return Promise.resolve(payment);
        }
        case PaymentState.Pending: {
          return Promise.reject(payment);
        }
      }
    };

    promisePoller({
      taskFn,
      interval: 1500,
      retries: 50,
    });
  }

  async pay() {
    try {
      this.loading = true;

      await this.$store.dispatch('erc20/approve', {
        contract: this.contract,
        to: chainInfo[this.payment.chainId].relayer,
        amount: this.payment.amount,
        poolId: this.payment.poolId,
      });

      await this.$store.dispatch('payments/pay');

      this.waitForPaymentCompleted();
    } catch (error) {
      this.error = String(error);

      await this.$store.dispatch('payments/read', {
        paymentId: this.payment.id,
        accessToken: this.payment.token,
      });

      this.loading = false;
    }
  }
}
</script>
