<template>
    <div>
        <h2 class="mb-3">Settings</h2>
        <b-card class="shadow-sm mb-5" v-if="pool" header-class="p-0">
            <template #header>
                <b-nav card-header tabs pills class="px-3 border-0">
                    <b-nav-text active v-for="(item, key) in childRoutes" :key="key">
                        <b-button
                            :variant="$route.path.endsWith(item.route) ? 'primary' : 'link'"
                            class="rounded-pill"
                            :to="`/pool/${pool._id}/settings/${item.route}`"
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
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        pools: 'pools/all',
    }),
})
export default class SettingsView extends Vue {
    pools!: IPools;
    childRoutes = [
        {
            name: 'General',
            class: 'fas fa-cog',
            route: 'general',
        },
        {
            name: 'Team',
            class: 'fas fa-users',
            route: 'team',
        },
        {
            name: 'Appearance',
            class: 'fas fa-sliders-h',
            route: 'appearance',
        },
        {
            name: 'Widget',
            class: 'fas fa-share-alt',
            route: 'widget',
        },
        {
            name: 'Invoices',
            class: 'fas fa-credit-card',
            route: 'invoices',
        },
    ];

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
