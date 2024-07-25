<template>
    <div class="container-md">
        <h2 class="my-3">Developer</h2>
        <b-card class="shadow-sm mb-5" header-class="p-0">
            <template #header>
                <b-nav card-header tabs pills class="px-3 border-0">
                    <b-nav-text active v-for="(item, key) in childRoutes" :key="key">
                        <b-button
                            :variant="$route.path.endsWith(item.route) ? 'primary' : 'link'"
                            class="rounded-pill"
                            :to="`/developer/${item.route}`"
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
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class DeveloperView extends Vue {
    childRoutes = [
        {
            name: 'API',
            class: 'fas fa-key',
            route: 'api',
        },
        {
            name: 'Identity',
            class: 'fas fa-id-badge',
            route: 'identities',
        },
        {
            name: 'Events',
            class: 'fas fa-bullhorn',
            route: 'events',
        },
        {
            name: 'Webhooks',
            class: 'fas fa-globe',
            route: 'webhooks',
        },
    ];
    mounted() {
        //
    }
}
</script>
