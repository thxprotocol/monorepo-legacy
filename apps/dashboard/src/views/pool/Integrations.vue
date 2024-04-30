<template>
    <div>
        <h2 class="mb-3">Integrations</h2>
        <b-card class="shadow-sm mb-5" v-if="pool && pool.settings" header-class="p-0">
            <template #header>
                <b-nav card-header tabs pills class="px-3 border-0">
                    <b-nav-text active v-for="(item, key) in childRoutes" :key="key">
                        <b-button
                            :variant="$route.path.endsWith(item.route) ? 'primary' : 'link'"
                            class="rounded-pill"
                            :to="`/pool/${pool._id}/integrations/${item.route}`"
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
    computed: {
        ...mapGetters({
            pools: 'pools/all',
        }),
    },
})
export default class SettingsTwitterView extends Vue {
    pools!: IPools;
    childRoutes = [
        {
            name: 'Twitter',
            class: 'fab fa-twitter',
            route: 'twitter',
        },
        {
            name: 'Discord',
            class: 'fab fa-discord',
            route: 'discord',
        },
        {
            name: 'Galachain',
            class: 'fa-kit fa-gala',
            route: 'galachain',
        },
        {
            name: 'Telegram',
            class: 'fab fa-telegram',
            route: 'telegram',
        },
    ];

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.$store.dispatch('pools/read', this.$route.params.id);
    }
}
</script>
