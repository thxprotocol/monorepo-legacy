<template>
    <div v-if="profile.shopifyStoreUrl">
        <b-form-group>
            <label>Store URL</label>
            <b-form-input :value="profile.shopifyStoreUrl" disabled />
            <label>Min order amount</label>
            <b-form-input type="number" :value="amount" @change="onChange" placeholder="e.g. 50" min="1" />
        </b-form-group>
    </div>
    <div v-else>Please, go to the Account page and connect your Shopify Store with the THX App</div>
</template>

<script lang="ts">
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownShopifyPurchase extends Vue {
    profile!: IAccount;
    @Prop({ required: false }) item!: string;

    amount: number | null = null;

    mounted() {
        if (this.item) {
            this.amount = Number(JSON.parse(this.item).amount);
        }
    }

    onChange(amount: number) {
        if (!amount) {
            return;
        }
        this.amount = amount;
        this.$emit('selected', JSON.stringify({ amount: this.amount, shopifyStoreUrl: this.profile.shopifyStoreUrl }));
    }
}
</script>
