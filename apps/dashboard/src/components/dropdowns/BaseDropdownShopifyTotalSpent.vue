<template>
    <div v-if="profile.shopifyStoreUrl">
        <b-form-group
            label="Minimal order amount"
            :description="`Will verify if a customer has spent at least ${amount} in your store.`"
        >
            <b-form-input type="number" :value="amount" @change="onChange" min="0" />
        </b-form-group>
    </div>
    <div v-else>
        <b-alert variant="info" show>
            <i class="fas fa-link mr-2"></i>
            Shopify Store not connected. <b-link to="/account">Connect</b-link>
        </b-alert>
    </div>
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
export default class BaseDropdownShopifyTotalSpent extends Vue {
    profile!: IAccount;
    amount: number | null = null;

    @Prop({ required: false }) item!: string;

    mounted() {
        this.amount = this.item ? Number(JSON.parse(this.item).amount) : 0;
    }

    onChange(amount: number) {
        this.amount = amount;
        this.$emit('selected', JSON.stringify({ amount: this.amount, shopifyStoreUrl: this.profile.shopifyStoreUrl }));
    }
}
</script>
