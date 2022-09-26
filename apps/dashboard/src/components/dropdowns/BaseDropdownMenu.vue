<template>
    <b-dropdown size="sm" variant="primary" no-caret toggle-class="d-flex align-items-center">
        <template #button-content>
            <i class="fas fa-bars m-0 p-1 px-2" aria-hidden="true" style="font-size: 1.5rem"></i>
        </template>
        <b-dropdown-item to="/tokens"> Tokens </b-dropdown-item>
        <b-dropdown-item to="/nft"> NFT </b-dropdown-item>
        <b-dropdown-item to="/pools"> Pools </b-dropdown-item>
        <b-dropdown-item to="/integrations"> Integrations </b-dropdown-item>
        <b-dropdown-item :href="docsUrl"> Documentation </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item :href="walletUrl">
            <span class="text-muted"><i class="fas fa-chart-line mr-3"></i>Go to Web Wallet</span>
        </b-dropdown-item>
        <b-dropdown-item to="/account">
            <span class="text-muted"><i class="fas fa-user mr-3"></i>Account</span>
        </b-dropdown-item>
        <b-dropdown-item size="sm" variant="dark" to="/signout">
            <span class="text-muted"><i class="fas fa-sign-out-alt mr-3"></i>Logout</span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownMenu extends Vue {
    walletUrl = process.env.VUE_APP_WALLET_URL;
    docsUrl = process.env.VUE_APP_DOCS_URL;

    mounted() {
        this.$store.dispatch('account/getHealth');
    }
}
</script>
