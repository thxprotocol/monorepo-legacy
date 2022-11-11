<template>
    <div class="page-token">
        <base-jumbotron-demo />
        <base-demo-description />
        <base-features />
        <base-testimonials :home="true" />
        <base-contact :dark="true" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BButton } from 'bootstrap-vue';
import BaseFeatures from '@thxnetwork/public/components/BaseFeatures.vue';
import BaseJumbotronDemo from '@thxnetwork/public/components/demo/BaseJumbotronDemo.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseDemoDescription from '@thxnetwork/public/components/BaseDemoDescription.vue';
import BaseTestimonials from '@thxnetwork/public/components/BaseTestimonials.vue';
import { DEMO_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

@Component({
    metaInfo: {
        title: DEMO_TAGS.TITLE,
        meta: [
            { name: 'title', content: DEMO_TAGS.TITLE },
            { name: 'description', content: DEMO_TAGS.DESCRIPTION },
            { name: 'keywords', content: DEMO_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: DEMO_TAGS.TITLE },
            { name: 'twitter:description', content: DEMO_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: DEMO_TAGS.TITLE },
            { property: 'og:title', content: DEMO_TAGS.TITLE },
            { property: 'og:description', content: DEMO_TAGS.DESCRIPTION },
            { property: 'og:type', content: DEMO_TAGS.OG_TYPE },
            { property: 'og:site_name', content: DEMO_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: DEMO_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.DEMO }],
    },
    components: {
        BButton,
        BaseJumbotronDemo,
        BaseDemoDescription,
        BaseFeatures,
        BaseTestimonials,
        BaseContact,
    },
})
export default class Demo extends Vue {}
</script>
