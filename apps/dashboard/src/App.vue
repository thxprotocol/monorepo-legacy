<template>
    <div id="app" :class="{ 'is-authenticated': profile }">
        <base-navbar v-if="profile" />
        <div class="sidebar-sibling">
            <b-navbar
                class="py-0 navbar-top"
                toggleable="md"
                :type="isDarkModeEnabled ? 'dark' : 'light'"
                :variant="isDarkModeEnabled ? 'darker' : 'white'"
                v-if="$route.name !== 'preview'"
            >
                <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                <b-collapse id="nav-collapse" is-nav>
                    <b-navbar-nav>
                        <b-nav-item class="mx-3" to="/campaigns">
                            <i class="fas fa-megaphone mr-2"></i>
                            Campaigns
                        </b-nav-item>
                        <b-nav-item class="mx-3" to="/coins">
                            <i class="fas fa-coins mr-2" />
                            Coins
                        </b-nav-item>
                        <b-nav-item class="mx-3" to="/nft">
                            <i class="fas fa-palette mr-2" />
                            NFT
                        </b-nav-item>
                        <b-nav-item class="mx-3" to="/developer">
                            <i class="fas fa-code mr-2" />
                            Developer
                        </b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
                <b-button variant="link" @click="onClickDarkModeToggle">
                    <i
                        class="fas m-0"
                        style="font-size: 1rem"
                        :class="isDarkModeEnabled ? 'fa-sun text-warning' : 'fa-moon text-dark'"
                    />
                </b-button>
                <b-dropdown variant="link" size="sm" no-caret right toggle-class="p-0 ml-3">
                    <template #button-content>
                        <b-avatar size="sm" variant="light" :src="profile && profile.profileImg"></b-avatar>
                    </template>
                    <b-dropdown-item to="/account">Account</b-dropdown-item>
                    <b-dropdown-item :href="docsUrl" target="_blank">Guides</b-dropdown-item>
                    <b-dropdown-item href="https://discord.com/invite/thx-network-836147176270856243" target="_blank">
                        Support
                    </b-dropdown-item>
                    <!-- <b-dropdown-item to="/invoices" disabled>Invoices</b-dropdown-item> -->
                    <b-dropdown-divider />
                    <b-dropdown-item to="/signout">Sign out</b-dropdown-item>
                </b-dropdown>
            </b-navbar>
            <router-view :key="$route.fullPath" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { initGTM } from '@thxnetwork/dashboard/utils/ga';
import { GTM, DOCS_URL } from '@thxnetwork/dashboard/config/secrets';
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
    isDarkModeEnabled = false;
    docsUrl = DOCS_URL;

    created() {
        if (GTM) initGTM();

        this.isDarkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setDarkMode(this.isDarkModeEnabled);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
            this.isDarkModeEnabled = matches;
            this.setDarkMode(this.isDarkModeEnabled);
        });
    }

    setDarkMode(state: boolean) {
        document.documentElement.classList[state ? 'add' : 'remove']('dark-mode');
    }

    onClickDarkModeToggle() {
        this.isDarkModeEnabled = !this.isDarkModeEnabled;
        this.setDarkMode(this.isDarkModeEnabled);
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
