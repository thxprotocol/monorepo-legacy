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
                        <i class="fas fa-users mr-1"></i>
                        Team
                    </template>
                    <BaseTabSettingsTeam />
                </b-tab>
                <b-tab>
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-sliders-h mr-1"></i>
                            Appearance
                        </div>
                    </template>
                    <BaseTabSettingsTheme />
                </b-tab>
                <b-tab>
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-share-alt mr-1"></i>
                            Widget
                        </div>
                    </template>
                    <BaseTabSettingsWidget />
                </b-tab>
                <b-tab disabled>
                    <template #title>
                        <i class="fas fa-tags mr-1"></i>
                        Commerce
                        <b-badge variant="dark" class="ml-2 text-white"> New </b-badge>
                    </template>
                    <BaseTabSettingsCommerce />
                </b-tab>
            </b-tabs>
            <router-view :key="$route.fullPath" />
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseTabSettingsGeneral from '@thxnetwork/dashboard/views/pool/settings/General.vue';
import BaseTabSettingsCommerce from '@thxnetwork/dashboard/views/pool/settings/Commerce.vue';
import BaseTabSettingsWidget from '@thxnetwork/dashboard/views/pool/settings/Widget.vue';
import BaseTabSettingsTheme from '@thxnetwork/dashboard/views/pool/settings/Theme.vue';
import BaseTabSettingsTeam from '@thxnetwork/dashboard/views/pool/settings/Team.vue';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { TAccount } from '@thxnetwork/types/interfaces';
import { hasBasicAccess } from '@thxnetwork/common';

@Component({
    components: {
        BaseTabSettingsGeneral,
        BaseTabSettingsWidget,
        BaseTabSettingsCommerce,
        BaseTabSettingsTheme,
        BaseTabSettingsTeam,
    },
    computed: {
        ...mapGetters({
            profile: 'account/profile',
            pools: 'pools/all',
        }),
    },
})
export default class SettingsView extends Vue {
    profile!: TAccount;
    dashboardUrl = BASE_URL;
    pools!: IPools;
    hasBasicAccess = hasBasicAccess;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
