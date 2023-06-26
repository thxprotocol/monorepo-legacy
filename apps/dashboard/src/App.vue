<template>
    <div id="app" :class="{ 'is-authenticated': profile }">
        <base-navbar v-if="profile" />
        <div class="sidebar-sibling">
            <b-alert v-if="profile" show variant="primary" class="alert-top">
                <b-link href="https://roadmap.thx.network" target="_blank">
                    <i class="fas fa-calendar mr-2"></i>
                    Vote on new features to directly shape THX Networks roadmap for 2023!
                </b-link>
            </b-alert>
            <router-view :key="$route.fullPath" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { initGTM } from '@thxnetwork/dashboard/utils/ga';
import { GTM } from '@thxnetwork/dashboard/utils/secrets';
import type { TAccount } from '@thxnetwork/types/interfaces';
import BaseDropdownAccount from './components/dropdowns/BaseDropdownAccount.vue';
import BaseNavbar from './components/BaseNavbar.vue';
import BaseDropdownMenu from './components/dropdowns/BaseDropdownMenu.vue';

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
    profile!: TAccount;

    created() {
        if (GTM) initGTM();
    }
}
</script>

<style lang="scss">
.alert-top {
    border: 0;
    border-radius: 0;
}

#app {
    opacity: 0;
    transition: 0.25s opacity ease;

    &.is-authenticated {
        opacity: 1;
    }

    &:not(.is-authenticated) {
        padding: 2rem 0 3rem;
        height: auto;

        @media (min-width: 768px) {
            height: 100%;

            .sidebar-sibling {
                height: 100%;
                margin-left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>
