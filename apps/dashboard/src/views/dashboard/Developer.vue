<template>
    <div class="container-xl">
        <b-jumbotron
            class="mt-3 jumbotron-header"
            bg-variant="light"
            :style="{
                'min-height': 'none',
                'border-radius': '1rem',
                'background-size': 'cover',
                'background-image': `url(${require('@thxnetwork/dashboard/../public/assets/thx_jumbotron.webp')})`,
            }"
        >
            <div class="container container-md py-5">
                <p class="brand-text">Developer</p>
            </div>
        </b-jumbotron>
        <div class="container-md">
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
    </div>
</template>

<script lang="ts">
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

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
            name: 'Wallets',
            class: 'fas fa-wallet',
            route: 'wallets',
        },
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
