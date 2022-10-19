<template>
  <base-modal
    :loading="loading"
    :error="error"
    title="Create a payment request"
    id="modalPaymentCreate"
  >
    <template #modal-body v-if="!loading">
      <b-form-row label="Variant" v-if="pool.erc721">
        <b-col md="6">
          <b-form-radio
            @change="onPaymentVariantChanged"
            v-model="paymentVariant"
            name="paymentVariant"
            :value="PaymentVariant.Token"
          >
            <strong> Token Payment</strong>
          </b-form-radio>
        </b-col>
        <b-col md="6">
          <b-form-radio
            @change="onPaymentVariantChanged"
            v-model="paymentVariant"
            name="paymentVariant"
            :value="PaymentVariant.NFT"
          >
            <strong> NFT Payment</strong>
          </b-form-radio>
        </b-col>
      </b-form-row>
      <hr />
      <b-form-group>
        <label>
          Promotion
          <base-tooltip-info
            class="mr-2"
            title="Select the promotion that should be shown when the payment succedes"
          />
        </label>
        <base-dropdown-promotion @selected="onSelectPromotion" />
      </b-form-group>

      <b-form-group v-if="showMetadataList">
        <label>
          NFT
          <base-tooltip-info
            class="mr-2"
            title="Select the metadata for the NFT that should be minted when the payment succedes"
          />
        </label>
        <BaseDropdownERC721Metadata :pool="pool" @selected="onSelectMetadata" />
      </b-form-group>
      <b-form-group>
        <template #label>
          Amount
          <i
            class="fas fa-info-circle text-gray"
            v-b-tooltip
            title="For precision purposes amounts are always stored in wei, but you can enter them in the format of your choice."
          ></i
        ></template>
        <b-input-group>
          <b-form-input type="number" v-model="amount" />
          <template #append>
            <b-dropdown
              :text="`${pool.erc20.symbol} (${unit})`"
              variant="primary"
            >
              <b-dropdown-item
                :key="key"
                v-for="(u, key) of units"
                @click="unit = key"
              >
                {{ key }}
              </b-dropdown-item>
            </b-dropdown>
          </template>
        </b-input-group>
        <small class="text-muted">
          {{ amountInWei }} {{ pool.erc20.symbol }} (wei)</small
        >
      </b-form-group>

      <b-form-group label="Success URL">
        <b-form-input v-model="successUrl" />
      </b-form-group>
      <b-form-group label="Fail URL">
        <b-form-input v-model="failUrl" />
      </b-form-group>
      <b-form-group label="Cancel URL">
        <b-form-input v-model="cancelUrl" />
      </b-form-group>
    </template>
    <template #btn-primary>
      <b-button
        :disabled="isSubmitDisabled"
        class="rounded-pill"
        @click="submit()"
        variant="primary"
        block
      >
        Create Payment Request
      </b-button>
    </template>
  </base-modal>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';
import { unitMap, Unit } from 'web3-utils';
import type { TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import BaseTooltipInfo from '../tooltips/BaseTooltipInfo.vue';
import BaseDropdownPromotion from '../dropdowns/BaseDropdownPromotion.vue';
import type { TPromotion } from '@thxnetwork/dashboard/store/modules/promotions';

enum PaymentVariant {
  Token = 0,
  NFT = 1,
}

@Component({
  components: {
    BaseTooltipInfo,
    BaseModal,
    BaseFormSelectNetwork,
    BaseDropdownERC721Metadata,
    BaseDropdownPromotion,
  },
  computed: mapGetters({}),
})
export default class BaseModalPaymentCreate extends Vue {
  units: any = unitMap;
  unit: Unit = 'ether';
  loading = false;
  error = '';

  amount = 0;
  successUrl = '';
  failUrl = '';
  cancelUrl = '';
  PaymentVariant = PaymentVariant;
  paymentVariant: PaymentVariant = PaymentVariant.Token;
  showMetadataList = false;
  selectedMetadataId: string | undefined = undefined;
  selectedPromotionId: string | undefined = undefined;

  get amountInWei() {
    return this.amount * this.units[this.unit];
  }

  get isSubmitDisabled() {
    if (
      this.loading ||
      this.amount <= 0 ||
      (this.paymentVariant && !this.selectedMetadataId) ||
      (this.selectedMetadataId && this.selectedPromotionId)
    ) {
      return true;
    }
    return false;
  }

  @Prop() pool!: IPool;

  async submit() {
    this.loading = true;

    const payment = {
      chainId: this.pool.chainId,
      amount: this.amountInWei,
      successUrl: this.successUrl.length > 0 ? this.successUrl : undefined,
      failUrl: this.failUrl.length > 0 ? this.failUrl : undefined,
      cancelUrl: this.cancelUrl.length > 0 ? this.cancelUrl : undefined,
      metadataId: this.selectedMetadataId,
      promotionId: this.selectedPromotionId,
    };

    await this.$store.dispatch('payments/create', { pool: this.pool, payment });

    this.$bvModal.hide(`modalPaymentCreate`);
    this.loading = false;
  }

  onSelectMetadata(metadata: TERC721Metadata) {
    this.selectedMetadataId = metadata._id;
  }

  onSelectPromotion(promotion: TPromotion) {
    this.selectedPromotionId = promotion._id;
  }

  onPaymentVariantChanged(variant: PaymentVariant) {
    switch (variant) {
      case PaymentVariant.NFT: {
        this.showMetadataList = true;
        break;
      }
      case PaymentVariant.Token: {
        this.showMetadataList = false;
        break;
      }
    }
    this.paymentVariant = variant;
  }
}
</script>
<style lang="scss"></style>
