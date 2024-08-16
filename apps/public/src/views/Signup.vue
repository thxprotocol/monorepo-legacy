<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DASHBOARD_URL } from '../config/secrets';

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
        const url = new URL(DASHBOARD_URL);
        url.pathname = 'signup';

        if (this.$route.query.signup_plan) {
            url.searchParams.append('signup_plan', String(this.$route.query.signup_plan));
        }

        if (this.$route.query.signup_email) {
            url.searchParams.append('signup_email', String(this.$route.query.signup_email));
        }

        if (this.$route.query.signup_offer) {
            url.searchParams.append('signup_offer', String(this.$route.query.signup_offer));
        }

        window.open(url, '_self');
    }
}
</script>
