<template>
    <div>
        <h2 class="mb-3">Settings</h2>
        <b-card class="shadow-sm mb-5" no-body v-if="pool">
            <b-tabs card pills active-nav-item-class="rounded-pill">
                <b-tab active>
                    <template #title>
                        <i class="fas fa-cog mr-1"></i>
                        General
                    </template>
                    <BaseTabSettingsGeneral />
                </b-tab>
                <b-tab>
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-gift mr-2"></i>
                            Widget
                        </div>
                    </template>
                    <BaseTabSettingsWidget />
                </b-tab>
                <b-tab>
                    <template #title>
                        <i class="fab fa-twitter mr-1"></i>
                        Twitter
                    </template>
                    <BaseTabSettingsTwitter />
                </b-tab>
                <b-tab>
                    <template #title>
                        <i class="fab fa-discord mr-1"></i>
                        Discord
                    </template>
                    <BaseTabSettingsDiscord />
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 1">
                    <template #title>
                        <i class="fas fa-tags mr-1"></i>
                        Commerce
                        <b-badge variant="dark" class="ml-2 text-white"> New </b-badge>
                    </template>
                    <BaseTabSettingsCommerce />
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 1">
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-key mr-1"></i>
                            API
                            <b-badge v-if="profile && profile.plan !== 1" variant="dark" class="ml-2 text-white">
                                Premium
                            </b-badge>
                        </div>
                    </template>
                    <BaseTabSettingsApi />
                </b-tab>
                <template #tabs-end>
                    <b-button
                        variant="success"
                        class="d-flex align-items-center ml-auto rounded-pill"
                        target="_blank"
                        :href="`${dashboardUrl}/preview/${$route.params.id}`"
                    >
                        <i class="fas fa-search mr-2"></i>
                        Preview Widget
                    </b-button>
                </template>
            </b-tabs>
            <router-view :key="$route.fullPath" />
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import BaseTabSettingsGeneral from '@thxnetwork/dashboard/views/pool/settings/General.vue';
import BaseTabSettingsCommerce from '@thxnetwork/dashboard/views/pool/settings/Commerce.vue';
import BaseTabSettingsDiscord from '@thxnetwork/dashboard/views/pool/settings/Discord.vue';
import BaseTabSettingsTwitter from '@thxnetwork/dashboard/views/pool/settings/Twitter.vue';
import BaseTabSettingsWidget from '@thxnetwork/dashboard/views/pool/settings/Widget.vue';
import BaseTabSettingsApi from '@thxnetwork/dashboard/views/pool/settings/API.vue';
import { DASHBOARD_URL } from '@thxnetwork/wallet/utils/secrets';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {
        BaseTabSettingsGeneral,
        BaseTabSettingsDiscord,
        BaseTabSettingsTwitter,
        BaseTabSettingsCommerce,
        BaseTabSettingsWidget,
        BaseTabSettingsApi,
    },
    computed: {
        ...mapGetters({
            profile: 'account/profile',
            pools: 'pools/all',
        }),
    },
})
export default class SettingsView extends Vue {
    profile!: IAccount;
    dashboardUrl = DASHBOARD_URL;
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
<style>
.nav-pills .nav-link.active,
.nav-pills .show > .nav-link {
    color: var(--primary);
    background-color: #e9ecef;
}
</style>
