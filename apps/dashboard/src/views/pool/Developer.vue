<template>
    <div>
        <h2 class="mb-3">Developer</h2>
        <b-card class="shadow-sm mb-5" no-body v-if="pool">
            <b-tabs card pills active-nav-item-class="rounded-pill">
                <b-tab>
                    <template #title>
                        <i class="fas fa-cog mr-2"></i>
                        General
                    </template>
                    <BaseTabSettingsGeneral />
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 1">
                    <template #title>
                        <i class="fas fa-wallet mr-2"></i>
                        Wallets
                    </template>
                    <BaseTabSettingsWallets />
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 1">
                    <template #title>
                        <i class="fas fa-wifi mr-2"></i>
                        Webhooks
                    </template>
                    <BaseTabSettingsWebhooks />
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 2">
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-key mr-2"></i>
                            API
                        </div>
                    </template>
                    <BaseTabSettingsApi />
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 2">
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-bullhorn mr-2"></i>
                            Events
                        </div>
                    </template>
                    ...
                </b-tab>
                <b-tab :disabled="profile && profile.plan !== 2">
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-file-alt mr-2"></i>
                            Logs
                        </div>
                    </template>
                    ...
                </b-tab>
            </b-tabs>
            <router-view :key="$route.fullPath" />
        </b-card>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TAccount } from '@thxnetwork/types/interfaces';
import BaseTabSettingsGeneral from '@thxnetwork/dashboard/views/pool/developer/General.vue';
import BaseTabSettingsWebhooks from '@thxnetwork/dashboard/views/pool/developer/Webhooks.vue';
import BaseTabSettingsWallets from '@thxnetwork/dashboard/views/pool/developer/Wallets.vue';
import BaseTabSettingsApi from '@thxnetwork/dashboard/views/pool/developer/API.vue';

@Component({
    components: {
        BaseTabSettingsGeneral,
        BaseTabSettingsWebhooks,
        BaseTabSettingsWallets,
        BaseTabSettingsApi,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class AssetPoolView extends Vue {
    profile!: TAccount;
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        //
    }
}
</script>
