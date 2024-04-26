<template>
    <div :class="{ 'fixed-top bg-white shadow': toggle || isNavVisible, 'fixed-top': !toggle }">
        <b-alert show variant="primary" class="p-2 ticker mb-0 border-0" style="border: 0; border-radius: 0">
            <div class="ticker-content">
                <b-link
                    style="font-size: 0.9rem"
                    href="https://medium.com/thxprotocol/revolutionizing-gaming-with-thx-networks-new-vote-escrowed-tokenomics-18ef24239e46"
                    target="_blank"
                >
                    <strong>Discover Staking Now 🎁</strong> Stake Your $THX on Balancer & Collect 70% of the Protocol
                    Fees. Early Stakers Get Extra Rewards
                    <i class="fas fa-chevron-right ml-2" />
                </b-link>
            </div>
        </b-alert>

        <b-navbar
            toggleable="xl"
            class="container"
            :class="`page-${$route.path.substring(1)} ${isDarkJumbotron ? 'navbar-text-white' : ''}`"
        >
            <router-link to="/" class="header-brand d-xl-none" :title="TITLES.HOME">
                <img
                    width="45"
                    height="45"
                    :src="require('../../public/assets/img/logo.svg')"
                    :alt="ALT_TEXT.HOME_THX_LOGO"
                />
            </router-link>

            <div class="align-items-center justify-content-end order-xl-4 ml-auto">
                <b-button
                    variant="link"
                    class="btn-icon rounded-circle text-dark mx-0 ml-xl-3"
                    target="_blank"
                    href="https://www.coingecko.com/en/coins/thx-network"
                >
                    <b-img width="22" height="auto" :src="require('../../public/assets/img/logo-coingecko.png')" />
                </b-button>
                <b-button
                    variant="link"
                    class="btn-icon rounded-circle text-dark mx-0"
                    target="_blank"
                    href="https://discord.gg/thx-network-836147176270856243"
                >
                    <i
                        class="fab fa-discord"
                        style="color: rgb(114, 137, 218); font-size: 0.7rem; text-decoration: none"
                    ></i>
                </b-button>
                <b-button
                    variant="link"
                    class="btn-icon rounded-circle text-dark mx-0"
                    target="_blank"
                    href="https://twitter.com/thxprotocol"
                >
                    <i
                        class="fab fa-twitter"
                        style="color: rgb(29, 161, 242); font-size: 0.7rem; text-decoration: none"
                    ></i>
                </b-button>
            </div>

            <b-navbar-toggle target="nav-collapse">
                <i class="fas fa-bars"></i>
            </b-navbar-toggle>

            <b-collapse id="nav-collapse" v-model="isNavVisible" is-nav>
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
                        <b-dropdown-item
                            :title="TITLES.TOKEN"
                            target="_blank"
                            href="https://www.coingecko.com/en/coins/thx-network"
                        >
                            $THX Token
                        </b-dropdown-item>
                        <b-dropdown-item
                            target="_blank"
                            href="https://opensea.io/assets/matic/0x804ad6f73c17bcb4e87cbc7cdf7e05fc6e4469b5/5"
                        >
                            Carbon Offset
                        </b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>

                <div class="navbar-nav-right">
                    <b-button
                        class="rounded-pill order-1 order-xl-0"
                        :variant="isDarkJumbotron && !toggle ? 'link-light' : 'link-dark'"
                        :href="dashboardUrl"
                        :title="TITLES.HOME_SIGN_IN"
                    >
                        <i class="fas fa-user mr-2" style="font-size: 1.1rem"></i>
                        Dashboard
                    </b-button>
                    <b-button class="rounded-pill ml-3" variant="primary" :href="widgetUrl" target="_blank">
                        <span>Explore Quests</span>
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
import { DASHBOARD_URL, WALLET_URL, DOCS_URL, WIDGET_URL } from '../config/secrets';

@Component({
    components: {},
})
export default class BaseNavbar extends Vue {
    walletUrl = WALLET_URL;
    widgetUrl = WIDGET_URL;
    docsUrl = DOCS_URL;
    toggle = false;
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
    isNavVisible = false;

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
<style>
.btn-icon.btn-link:hover {
    text-decoration: none !important;
}
.ticker {
    text-align: center;
}

@media (max-width: 992px) {
    .ticker {
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
    }

    .ticker-content {
        display: inline-block;
        animation: tickerMove 15s linear infinite;
    }

    @keyframes tickerMove {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-100%);
        }
    }
}
</style>
