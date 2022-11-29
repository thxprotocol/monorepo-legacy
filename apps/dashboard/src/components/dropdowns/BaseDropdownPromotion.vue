<template>
    <b-dropdown variant="link" size="sm" class="dropdown-select" v-if="promotions">
        <template #button-content>
            <div v-if="promotion">
                <div class="d-flex align-items-center">
                    {{ promotion.title }}
                </div>
            </div>
            <div v-else class="d-flex align-items-center">Select a Promotion</div>
        </template>
        <b-dropdown-item-button :key="p._id" v-for="p of promotionsForPool" @click="onListItemClick(p)">
            <div class="d-flex align-items-center">
                {{ p.title }}
            </div>
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import type { TPromotion } from '@thxnetwork/dashboard/store/modules/promotions';
import { IPromotions } from '@thxnetwork/dashboard/types/IPromotions';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        pools: 'pools/all',
        promotions: 'promotions/all',
    }),
})
export default class BaseDropdownPromotion extends Vue {
    pools!: IPools;
    promotions!: IPromotions;
    promotion: TPromotion | null = null;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get promotionsForPool() {
        return this.promotions[this.$route.params.id];
    }

    async mounted() {
        await this.$store.dispatch('promotions/list', this.pool);
    }

    onListItemClick(promotion: TPromotion) {
        this.promotion = promotion;
        this.$emit('selected', this.promotion);
    }
}
</script>
