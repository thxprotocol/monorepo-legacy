<template>
    <b-form-group label="Store URL">
        <b-form-input v-if="profile.shopifyStoreUrl" :value="profile.shopifyStoreUrl" disabled />
        <div v-else>Please, go to the Account page and connect your Shopify Store with the THX App</div>
    </b-form-group>
</template>

<script lang="ts">
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownShopifyPurchase extends Vue {
    profile!: IAccount;
}
</script>
