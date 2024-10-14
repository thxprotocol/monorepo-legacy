<template>
    <div :class="{ 'animate-nav-in': toggleNav }" class="bg-white">
        <base-navbar v-if="show" @toggle="toggleNav = $event" />
        <div v-else class="container">
            <b-button
                variant="outline-dark"
                size="sm"
                class="btn-signup-back rounded-pill m-3"
                to="/"
                :title="TITLES.HOME"
            >
                <i class="fas fa-caret-left mr-1"></i>
                Back to home
            </b-button>
        </div>
        <router-view />
        <cookie-law @accept="cookiesAccepted()" />
    </div>
</template>

<script lang="ts">
import BaseJumbotron from '@thxnetwork/public/components/BaseJumbotron.vue';
import BaseNavbar from '@thxnetwork/public/components/BaseNavbar.vue';
import CookieLaw from 'vue-cookie-law';
import { Component, Vue } from 'vue-property-decorator';
import { API_URL, GTM, WIDGET_ID } from './config/secrets';
import { TITLES } from './utils/constants';

@Component({
    metaInfo: {
        title: 'Allows you to pool funds and reward people. Designed developer first; thanks to an user friendly API, you integrate it easily with apps.',
        titleTemplate: '%s | THX Network',
    },
    components: {
        'cookie-law': CookieLaw,
        'base-jumbotron': BaseJumbotron,
        'base-navbar': BaseNavbar,
    },
})
export default class App extends Vue {
    TITLES = TITLES;
    toggleNav = false;

    get show() {
        return this.$route.name !== 'Signup';
    }

    cookiesAccepted() {
        (function (w: any, d, s, l: any, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                'event': 'gtm.js',
            });
            const f: any = d.getElementsByTagName(s)[0],
                j: any = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', GTM);
    }

    mounted() {
        if (WIDGET_ID && API_URL) {
            THXWidget.create({
                apiUrl: API_URL,
                campaignId: WIDGET_ID,
            });
        }
    }
}
</script>
