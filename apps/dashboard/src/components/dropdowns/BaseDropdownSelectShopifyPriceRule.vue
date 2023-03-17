<template>
    <b-dropdown variant="link" class="dropdown-select">
        <template #button-content>
            <div v-if="priceRule">
                <div class="d-flex align-items-center">
                    <strong class="mr-1">{{ priceRule.title }}</strong>
                </div>
            </div>
            <div v-else>Select a Price Rule</div>
        </template>
        <b-dropdown-item v-if="!hasPricesRules"> No price rules available. </b-dropdown-item>
        <b-dropdown-item-button :key="p.id" v-for="p of shopPriceRules" @click="onListItemClick(p)">
            <div class="d-flex align-items-center">
                <strong class="mr-1">{{ p.title }}</strong>
            </div>
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '../BaseIdenticon.vue';
import { IAccount } from '../../types/account';
import { TShopifyPriceRules, TShopifyPriceRule } from '@thxnetwork/dashboard/store/modules/shopifyPerks';
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        priceRules: 'shopifyPerks/priceRules',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    profile!: IAccount;
    priceRules!: TShopifyPriceRules;
    priceRule: TShopifyPriceRule | undefined | null = null;

    @Prop() pool!: IPool;
    @Prop({ required: false }) selectedPriceRuleId!: string;

    get hasPricesRules() {
        return this.priceRules && !!Object.values(this.priceRules).length;
    }

    get shopPriceRules() {
        if (!this.priceRules || !this.profile.shopifyStoreUrl) {
            return [];
        }
        return this.priceRules[this.profile.shopifyStoreUrl];
    }

    async mounted() {
        await this.$store.dispatch('shopifyPerks/listPriceRules', {
            pool: this.pool,
            shop: this.profile.shopifyStoreUrl,
        });

        if (this.selectedPriceRuleId) {
            this.priceRule = Object.values(this.shopPriceRules).find(
                (x: TShopifyPriceRule) => x.id == this.selectedPriceRuleId,
            );
        }
    }

    onListItemClick(priceRule: TShopifyPriceRule) {
        this.priceRule = priceRule;
        this.$emit('selected', this.priceRule);
    }
}
</script>
