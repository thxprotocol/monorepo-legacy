<template>
    <div>
        <h2 class="mb-3">Developer</h2>
        <b-card class="shadow-sm mb-5" no-body v-if="pool">
            <b-tabs card pills active-nav-item-class="rounded-pill">
                <b-tab active>
                    <template #title>
                        <i class="fas fa-cog mr-2"></i>
                        General
                    </template>
                    <BaseTabSettingsGeneral />
                </b-tab>
                <b-tab :disabled="!hasPremiumAccess(pool.owner)">
                    <template #title>
                        <i class="fas fa-wallet mr-2"></i>
                        Wallets
                    </template>
                    <BaseTabSettingsWallets />
                </b-tab>
                <b-tab :disabled="!hasPremiumAccess(pool.owner)">
                    <template #title>
                        <i class="fas fa-globe mr-2"></i>
                        Webhooks
                    </template>
                    <BaseTabSettingsWebhooks />
                </b-tab>
                <b-tab :disabled="!hasPremiumAccess(pool.owner)">
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-key mr-2"></i>
                            API
                        </div>
                    </template>
                    <BaseTabSettingsApi />
                </b-tab>
                <b-tab disabled>
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-bullhorn mr-2"></i>
                            Events
                        </div>
                    </template>
                    <BaseTabSettingsEvents />
                </b-tab>
                <b-tab disabled>
                    <template #title>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-file-alt mr-2"></i>
                            Logs
                        </div>
                    </template>
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
import { AccountPlanType } from '@thxnetwork/types/enums';
import { TAccount } from '@thxnetwork/types/interfaces';
import BaseTabSettingsGeneral from '@thxnetwork/dashboard/views/pool/developer/General.vue';
import BaseTabSettingsWebhooks from '@thxnetwork/dashboard/views/pool/developer/Webhooks.vue';
import BaseTabSettingsEvents from '@thxnetwork/dashboard/views/pool/developer/Events.vue';
import BaseTabSettingsWallets from '@thxnetwork/dashboard/views/pool/developer/Wallets.vue';
import BaseTabSettingsApi from '@thxnetwork/dashboard/views/pool/developer/API.vue';
import { hasPremiumAccess } from '@thxnetwork/common';

@Component({
    components: {
        BaseTabSettingsEvents,
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
    hasPremiumAccess = hasPremiumAccess;
    AccountPlanType = AccountPlanType;
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
