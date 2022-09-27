<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Promotions</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button v-b-modal="'modalPromotionCreate'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">Create a promotion</span>
                </b-button>
            </b-col>
        </b-row>
        <base-nothing-here
            v-if="!promotionsForPool"
            text-submit="Create a Promotion"
            title="You have not created a promotion yet"
            description="Let people redeem your tokens for secret URL's, discount codes, passwords or any other thing you can fit in a text box."
            @clicked="$bvModal.show('modalPromotionCreate')"
        />
        <b-row v-else>
            <b-col md="6" :key="promotion.id" v-for="promotion of promotionsForPool">
                <base-promotion :promotion="promotion" :pool="pool" />
            </b-col>
        </b-row>
        <modal-promotion-create :pool="pool" />
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxprotocol/dashboard/store/modules/pools';
import { IPromotions } from '@thxprotocol/dashboard/types/IPromotions';
import ModalPromotionCreate from '@thxprotocol/dashboard/components/modals/BaseModalPromotionCreate.vue';
import BasePromotion from '@thxprotocol/dashboard/components/cards/BasePromotion.vue';
import BaseNothingHere from '@thxprotocol/dashboard/components/BaseListStateEmpty.vue';

@Component({
    components: { BaseNothingHere, ModalPromotionCreate, BasePromotion },
    computed: mapGetters({
        pools: 'pools/all',
        promotions: 'promotions/all',
    }),
})
export default class PromotionsView extends Vue {
    pools!: IPools;
    promotions!: IPromotions;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get promotionsForPool() {
        return this.promotions[this.$route.params.id];
    }

    async mounted() {
        await this.$store.dispatch('promotions/list', this.pool);
    }
}
</script>
