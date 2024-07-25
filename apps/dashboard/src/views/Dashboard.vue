<template>
    <BaseCardLogin v-if="!account" />
    <div class="d-flex h-100 flex-column" v-else-if="account">
        <b-navbar
            class="py-0 navbar-top"
            toggleable="md"
            :type="isDarkModeEnabled ? 'dark' : 'light'"
            :variant="isDarkModeEnabled ? 'darker' : 'white'"
            v-if="$route.name !== 'preview'"
        >
            <router-link to="/" custom v-slot="{ navigate }" class="cursor-pointer mx-3">
                <img
                    :src="require('@thxnetwork/dashboard/../public/assets/logo.png')"
                    width="30"
                    height="30"
                    alt="THX logo"
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                />
            </router-link>
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
                    <b-avatar size="sm" variant="light" :src="account && account.profileImg"></b-avatar>
                </template>
                <b-dropdown-item to="/account">Account</b-dropdown-item>
                <b-dropdown-item to="/developer">Developer</b-dropdown-item>
                <b-dropdown-item to="/invoices" disabled>Invoices</b-dropdown-item>
                <b-dropdown-divider />
                <b-dropdown-item :href="docsUrl" target="_blank">Guides</b-dropdown-item>
                <b-dropdown-item href="https://discord.com/invite/thx-network-836147176270856243" target="_blank">
                    Support
                </b-dropdown-item>
                <b-dropdown-divider />
                <b-dropdown-item @click="onClickSignout">Sign out</b-dropdown-item>
            </b-dropdown>
        </b-navbar>
        <router-view />
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { DOCS_URL } from '@thxnetwork/dashboard/config/secrets';
import BaseDropdownAccount from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownAccount.vue';
import BaseNavbar from '@thxnetwork/dashboard/components/BaseNavbar.vue';
import BaseDropdownMenu from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenu.vue';
import BaseCardLogin from '@thxnetwork/dashboard/components/cards/BaseCardLogin.vue';

@Component({
    components: {
        BaseDropdownAccount,
        BaseDropdownMenu,
        BaseNavbar,
        BaseCardLogin,
    },
    computed: {
        ...mapState('auth', {
            session: 'session',
            isReady: 'isReady',
        }),
        ...mapGetters({
            account: 'account/profile',
        }),
    },
})
export default class App extends Vue {
    account!: TAccount;
    isReady!: boolean;
    isDarkModeEnabled = false;
    docsUrl = DOCS_URL;

    created() {
        this.isDarkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setDarkMode(this.isDarkModeEnabled);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
            this.isDarkModeEnabled = matches;
            this.setDarkMode(this.isDarkModeEnabled);
        });
    }

    @Watch('session')
    onSessionChange(session) {
        if (session) {
            console.log(session);
        }
    }

    setDarkMode(state: boolean) {
        document.documentElement.classList[state ? 'add' : 'remove']('dark-mode');
    }

    onClickDarkModeToggle() {
        this.isDarkModeEnabled = !this.isDarkModeEnabled;
        this.setDarkMode(this.isDarkModeEnabled);
    }
    async onClickSignout() {
        await this.$store.dispatch('auth/signOut');
        try {
            await this.$router.push({ path: '/' });
        } catch (error) {
            // Ignore redundant navigation to current location error
        }
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
