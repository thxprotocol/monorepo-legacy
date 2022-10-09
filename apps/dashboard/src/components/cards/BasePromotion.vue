<template>
  <b-card tag="article" class="mb-2">
    <b-dropdown class="float-right" variant="light">
      <b-dropdown-item v-b-modal="`modalDelete${promotion.id}`"
        >Remove</b-dropdown-item
      >
    </b-dropdown>
    <b-card-title>{{ promotion.title }}</b-card-title>
    <b-card-text>
      {{ promotion.description }}
    </b-card-text>
    <b-alert show variant="warning">
      <strong>{{ promotion.value }}</strong>
    </b-alert>
    <hr />
    <b-input-group size="lg" :append="pool.erc20.symbol">
      <b-form-input
        type="number"
        :value="promotion.price"
        disabled
      ></b-form-input>
    </b-input-group>
    <modal-delete
      :call="remove"
      :id="`modalDelete${promotion.id}`"
      :subject="promotion.id"
    />
  </b-card>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import ModalDelete from '../modals/BaseModalDelete.vue';
import { TPromotion } from '@thxnetwork/dashboard/store/modules/promotions';
import { IPromotions } from '@thxnetwork/dashboard/types/IPromotions';

@Component({
  components: {
    ModalDelete,
  },
  computed: mapGetters({
    promotions: 'promotions/all',
  }),
})
export default class PromoCodesView extends Vue {
  promotions!: IPromotions;

  @Prop() pool!: IPool;
  @Prop() promotion!: TPromotion;

  remove() {
    this.$store.dispatch('promotions/delete', {
      pool: this.pool,
      promotion: this.promotion,
    });
  }
}
</script>
