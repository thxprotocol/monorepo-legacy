<template>
    <div :class="toggle ? 'fixed-top bg-white shadow' : 'fixed-top'">
        <b-alert show variant="primary" class="text-center p-2">
            <b-link href="https://docs.thx.network/rewards/qr-codes" target="_blank">
                <strong>Unlock Rewards with QR Codes 🚀</strong> A Featured Campaign by the Royal Dutch Mint
                <i class="fas fa-chevron-right ml-2" />
            </b-link>
        </b-alert>

        <b-navbar
            toggleable="lg"
            class="container"
            :class="`page-${$route.path.substring(1)} ${isDarkJumbotron ? 'navbar-text-white' : ''}`"
        >
            <router-link to="/" class="header-brand d-lg-none" :title="TITLES.HOME">
                <img :src="require('../../public/assets/img/logo.svg')" :alt="ALT_TEXT.HOME_THX_LOGO" />
            </router-link>

            <b-navbar-toggle target="nav-collapse">
                <i class="fas fa-bars"></i>
            </b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
                <router-link to="/" :title="TITLES.HOME" class="header-brand">
                    <img :src="require('../../public/assets/img/logo.svg')" :alt="ALT_TEXT.HOME_THX_LOGO" />
                </router-link>
                <b-navbar-nav>
                    <b-nav-item to="/pricing" :title="TITLES.PRICING">Pricing</b-nav-item>
                    <b-nav-item to="/use-cases" :title="TITLES.USECASES">Use Cases</b-nav-item>
                    <b-nav-item to="/solutions" :title="TITLES.SOLUTIONS">Solutions</b-nav-item>
                    <b-nav-item to="/contact" :title="TITLES.CONTACT">Contact</b-nav-item>

                    <b-nav-item-dropdown no-caret right>
                        <template #button-content>
                            More
                            <i class="fas fa-caret-down" />
                        </template>
                        <b-dropdown-item :title="TITLES.TOKEN" to="/token">$THX Token</b-dropdown-item>
                        <b-dropdown-item
                            target="_blank"
                            href="https://opensea.io/assets/matic/0x804ad6f73c17bcb4e87cbc7cdf7e05fc6e4469b5/5"
                        >
                            Carbon Offset
                        </b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>

                <div class="navbar-nav-right">
                    <b-button variant="outline-primary" class="rounded-pill" to="/campaigns" :title="TITLES.CAMPAIGNS">
                        Campaigns
                    </b-button>
                    <b-button
                        class="rounded-pill"
                        :variant="isDarkJumbotron && !toggle ? 'link-light' : 'link-dark'"
                        :href="dashboardUrl"
                        :title="TITLES.HOME_SIGN_IN"
                    >
                        <i class="fas fa-user mr-2" style="font-size: 1.1rem"></i>
                        Dashboard
                    </b-button>
                    <b-button class="rounded-pill ml-3" variant="primary" to="/pricing" :title="TITLES.HOME_LIVE_DEMO">
                        <span>Free Trial</span>
                        <i class="fas fa-chevron-right"></i>
                    </b-button>
                </div>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ALT_TEXT, TITLES } from '@thxnetwork/public/utils/constants';
import { DASHBOARD_URL, WALLET_URL, DOCS_URL } from '../config/secrets';

@Component({
    components: {},
})
export default class BaseNavbar extends Vue {
    walletUrl = WALLET_URL;
    docsUrl = DOCS_URL;
    toggle = false;
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;

    get isDarkJumbotron() {
        return (
            this.$route.path.startsWith('/demo') ||
            this.$route.path.startsWith('/token') ||
            this.$route.path.startsWith('/use-case')
        );
    }

    get dashboardUrl() {
        const url = new URL(DASHBOARD_URL);
        const ref = this.$route.query.ref;
        if (!ref) return url.toString();
        url.searchParams.append('referralCode', String(ref));
        return url.toString();
    }

    created() {
        window.addEventListener('scroll', this.onScroll);
    }

    destroyed() {
        window.removeEventListener('scroll', this.onScroll);
    }

    onScroll() {
        this.toggle = window.scrollY > 50;
    }
}
</script>
