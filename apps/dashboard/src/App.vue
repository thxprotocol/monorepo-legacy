<template>
    <div id="app">
        <base-navbar v-if="profile" />
        <div class="sidebar-sibling">
            <b-alert v-if="profile" show variant="primary" class="alert-top">
                <b-link href="https://roadmap.thx.network" target="_blank">
                    <i class="fas fa-calendar mr-2"></i>
                    Vote on new features to directly shape THX Networks roadmap for 2023!
                </b-link>
            </b-alert>
            <base-dropdown-menu
                v-if="profile"
                class="d-flex d-md-none position-fixed justify-content-end p-2"
                style="right: 0; z-index: 1"
            />
            <router-view :key="$route.fullPath" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { IAccount } from './types/account';
import { initGTM } from '@thxnetwork/dashboard/utils/ga';
import { initWidget } from '@thxnetwork/dashboard/utils/widget';
import BaseDropdownAccount from './components/dropdowns/BaseDropdownAccount.vue';
import BaseNavbar from './components/BaseNavbar.vue';
import BaseDropdownMenu from './components/dropdowns/BaseDropdownMenu.vue';
import { WIDGET_ID, GTM } from '@thxnetwork/dashboard/utils/secrets';

@Component({
    components: {
        BaseDropdownAccount,
        BaseDropdownMenu,
        BaseNavbar,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class App extends Vue {
    profile!: IAccount;

    created() {
        if (GTM) initGTM();
        if (WIDGET_ID) initWidget();
    }
}
</script>

<style>
.alert-top {
    border: 0;
    border-radius: 0;
}
</style>
