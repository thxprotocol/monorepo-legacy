<template>
    <div>
        <h2 class="mb-3">Developer</h2>
        <b-card class="shadow-sm mb-5" v-if="pool" header-class="p-0">
            <template #header>
                <b-nav card-header tabs pills class="px-3 border-0">
                    <b-nav-text active v-for="(item, key) in childRoutes" :key="key">
                        <b-button
                            :variant="$route.path.endsWith(item.route) ? 'primary' : 'link'"
                            class="rounded-pill"
                            :to="`/pool/${pool._id}/developer/${item.route}`"
                        >
                            <i class="ml-0 mr-2" :class="item.class"></i>
                            {{ item.name }}
                        </b-button>
                    </b-nav-text>
                </b-nav>
            </template>
            <router-view />
        </b-card>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class AssetPoolView extends Vue {
    pools!: IPools;
    childRoutes = [
        {
            name: 'General',
            class: 'fas fa-cog',
            route: 'general',
        },
        {
            name: 'Wallets',
            class: 'fas fa-wallet',
            route: 'wallets',
        },
        {
            name: 'Webhooks',
            class: 'fas fa-globe',
            route: 'webhooks',
        },
        {
            name: 'Events',
            class: 'fas fa-bullhorn',
            route: 'events',
        },
        {
            name: 'API',
            class: 'fas fa-key',
            route: 'api',
        },
    ];

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
