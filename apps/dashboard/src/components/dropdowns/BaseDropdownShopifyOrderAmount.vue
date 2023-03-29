<template>
    <b-form-group
        v-if="profile.shopifyStoreUrl"
        label="Minimal order amount"
        :description="`Will verify if a customer has created at least ${amount} orders.`"
    >
        <b-form-input type="number" :value="amount" @change="onChange" min="0" />
    </b-form-group>
    <b-alert variant="info" show v-else>
        <i class="fas fa-link mr-2"></i>
        Shopify Store not connected. <b-link to="/account">Connect</b-link>
    </b-alert>
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
export default class BaseDropdownShopifyOrderAmount extends Vue {
    profile!: IAccount;
    amount: number | null = null;

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    mounted() {
        this.amount = this.contentMetadata ? this.contentMetadata.amount : 0;
    }

    onChange(amount: number) {
        this.amount = amount;
        this.$emit('selected', {
            content: this.profile.shopifyStoreUrl,
            contentMetadata: { amount: this.amount, shopifyStoreUrl: this.profile.shopifyStoreUrl },
        });
    }
}
</script>
