<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DASHBOARD_URL, WIDGET_ID } from '../config/secrets';

const META_TITLE = 'Signup';
const META_DESCRIPTION = '';

@Component({
    metaInfo: {
        title: META_TITLE,
        meta: [
            { name: 'title', content: META_TITLE },
            { name: 'description', content: META_DESCRIPTION },
            { name: 'keywords', content: 'signup, join, free' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: META_TITLE },
            { name: 'twitter:description', content: META_DESCRIPTION },
            { name: 'twitter:image:alt', content: META_TITLE },
            { property: 'og:title', content: META_TITLE },
            { property: 'og:description', content: META_DESCRIPTION },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'Sign Up' },
            { property: 'og:url', content: document.location.href },
        ],
    },
})
export default class Signup extends Vue {
    mounted() {
        const ref = window.localStorage.getItem(`thx:widget:${WIDGET_ID}:ref`) as string;
        const url = new URL(DASHBOARD_URL);
        if (ref) {
            url.searchParams.append('referralCode', ref);
        }
        if (this.$route.query.signup_plan) {
            url.searchParams.append('signup_plan', String(this.$route.query.signup_plan));
        }
        window.open(url);
    }
}
</script>
