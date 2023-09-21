<template>
    <div class="page-home">
        <base-jumbotron />
        <base-code-example />
        <base-metrics />
        <base-no-code />
        <base-partners />
        <base-technologies />
        <base-features />
        <base-testimonials :home="true" />
        <base-use-cases />
        <base-about-us />
        <base-team />
        <base-contact :dark="true" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseJumbotron from '@thxnetwork/public/components/BaseJumbotron.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseTeam from '@thxnetwork/public/components/BaseTeam.vue';
import BasePartners from '@thxnetwork/public/components/BasePartners.vue';
import BaseCodeExample from '@thxnetwork/public/components/BaseCodeExample.vue';
import BaseFeatures from '@thxnetwork/public/components/BaseFeatures.vue';
import BaseAboutUs from '@thxnetwork/public/components/BaseAboutUs.vue';
import BaseTestimonials from '@thxnetwork/public/components/BaseTestimonials.vue';
import BaseTechnologies from '@thxnetwork/public/components/BaseTechnologies.vue';
import BaseMetrics from '@thxnetwork/public/components/BaseMetrics.vue';
import BaseUseCases from '@thxnetwork/public/components/BaseUseCases.vue';
import BaseNoCode from '@thxnetwork/public/components/BaseNoCode.vue';
import { HOME_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

@Component({
    metaInfo: {
        title: HOME_TAGS.TITLE,
        meta: [
            { name: 'title', content: HOME_TAGS.TITLE },
            { vmid: 'description', name: 'description', content: HOME_TAGS.DESCRIPTION },
            { name: 'keywords', content: HOME_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: HOME_TAGS.TITLE },
            { name: 'twitter:description', content: HOME_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: HOME_TAGS.TITLE },
            { property: 'og:title', content: HOME_TAGS.TITLE },
            { property: 'og:description', content: HOME_TAGS.DESCRIPTION },
            { property: 'og:type', content: HOME_TAGS.OG_TYPE },
            { property: 'og:site_name', content: HOME_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: HOME_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.HOME }],
    },
    components: {
        BaseJumbotron,
        BaseCodeExample,
        BaseNoCode,
        BasePartners,
        BaseFeatures,
        BaseTechnologies,
        BaseTestimonials,
        BaseMetrics,
        BaseUseCases,
        BaseAboutUs,
        BaseTeam,
        BaseContact,
    },
})
export default class Home extends Vue {}
</script>
