<template>
    <div v-if="profile.shopifyStoreUrl">
        <b-form-group
            label="Minimal order amount"
            description="Will verify if a customers e-mail address is known to have ordered once for at least this amount."
        >
            <b-form-input type="number" :value="amount" @change="onChange" min="1" />
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
