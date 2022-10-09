<template>
  <b-list-group-item>
    <div class="d-flex align-items-center w-100">
      <div class="mr-3">
        <i class="fas fa-tags text-muted"></i>
      </div>
      <div class="mr-auto">
        <strong>{{ promotion.title }}</strong>
        <br />
        <p>
          {{ promotion.description }}
        </p>
      </div>
    </div>
    <!-- <div class="text-center">
            <b-button
                v-if="membership && !promotion.value && erc20"
                variant="primary"
                :disabled="error || busy"
                v-b-modal="`modalDepositPool-${promotion.id}`"
            >
                Pay <strong>{{ promotion.price }} {{ erc20.symbol }}</strong>
            </b-button>
        </div> -->
    <template v-if="promotion.value">
      <b-alert class="w-100 m-0 mr-3" show variant="warning">
        <strong>Promotion unlocked:</strong><br />
        {{ promotion.value }}
      </b-alert>
    </template>
    <base-modal-redeem-promotion
      :erc20="erc20"
      :promotion="promotion"
      :membership="membership"
    />
  </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TMembership } from '@thxnetwork/wallet/store/modules/memberships';
import { TPromotion } from '@thxnetwork/wallet/store/modules/promotions';
import BaseModalRedeemPromotion from '@thxnetwork/wallet/components/modals/ModalRedeemPromotion.vue';
import { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';

@Component({
  components: {
    BaseModalRedeemPromotion,
  },
})
export default class BaseListGroupItemWithdrawal extends Vue {
  busy = false;
  error = '';

  @Prop() promotion!: TPromotion;
  @Prop() membership!: TMembership;
  @Prop() erc20!: TERC20;
}
</script>
