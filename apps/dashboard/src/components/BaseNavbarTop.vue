<template>
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
</template>

<script lang="ts">
import { DOCS_URL } from '@thxnetwork/dashboard/config/secrets';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

@Component({
    computed: {
        ...mapState('account', {
            isDarkModeEnabled: 'isDarkModeEnabled',
        }),
        ...mapGetters({
            account: 'account/profile',
        }),
    },
})
export default class BaseNavbarTop extends Vue {
    docsUrl = DOCS_URL;
    account!: TAccount;
    isDarkModeEnabled!: boolean;

    onClickDarkModeToggle() {
        this.$store.commit('account/setDarkMode', !this.isDarkModeEnabled);
    }

    async onClickSignout() {
        await this.$store.dispatch('auth/signOut');
        try {
            await this.$router.push({ name: 'login' });
        } catch (error) {
            // Ignore redundant navigation to current location error
        }
    }
}
</script>
