<template>
    <section>
        <b-jumbotron style="min-height: 0;" bg-variant="secondary">
            <div class="container">
                <div class="row pt-5 pt-lg-10 mb-lg-n5">
                    <div class="col-lg-8 offset-lg-2 mb-n5">
                        <h1 class="brand-text text-center">
                            Reward your<br />
                            loyal customers<br /><br />
                        </h1>
                        <img class="img-fluid mb-n5" v-lazy="require('../../../public/assets/img/thx_landing_award.webp')" alt="" />
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5">
                <div class="col-lg-6 offset-lg-3 pb-3 text-center">
                    <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Engagement</h2>
                        <p class="lead mb-4 font-size-l">
                            For customer relationship managers
                        </p>
                    </div>
                    <p>
                        Use THX to reward members in your community with points for all types of engagements. Imagine
                        rewarding people for completing their profile and your members being able to spend these points
                        for premium content. People gain a richer experience in your app or community, boosting your
                        engagement metrics.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-8 offset-lg-2 text-center">
                    <img class="img-fluid" v-lazy="require('../../../public/assets/img/thx_landing_emoji.webp')" alt="" />
                </div>
            </div>
            <div class="row pt-5 pb-5">
                <div class="col-lg-6 offset-lg-3 pb-3 text-center">
                    <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Technology</h2>
                        <p class="lead mb-4 font-size-l">
                            Why Blockchain?
                        </p>
                    </div>
                    <p>
                        Rewards earned with blockchain powered gamification can easily be shared across technology
                        platforms both inside and outside of your organization or online community. This includes
                        sharing through online links and even offline using QR-codes.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-8 offset-lg-2 text-center">
                    <img class="img-fluid" v-lazy="require('../../../public/assets/img/thx_landing_pulse.webp')" alt="" />
                </div>
            </div>
        </div>
        <base-testimonials :home="false" />
        <base-partners />
        <div class="container">
            <div class="row">
                <div class="col-lg-6 offset-lg-3 text-center">
                    <base-use-case-contact />
                </div>
            </div>
        </div>
        <base-use-cases />
        <base-contact :dark="true" />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseUseCases from '@thxnetwork/public/components/BaseUseCases.vue';
import BaseUseCaseContact from '@thxnetwork/public/components/BaseUseCaseContact.vue';
import BasePartners from '@thxnetwork/public/components/BasePartners.vue';
import BaseTestimonials from '@thxnetwork/public/components/BaseTestimonials.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import { USE_CASES_REWARD_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

@Component({
    metaInfo: {
        title: USE_CASES_REWARD_TAGS.TITLE,
        meta: [
            { name: 'title', content: USE_CASES_REWARD_TAGS.TITLE },
            { name: 'description', content: USE_CASES_REWARD_TAGS.DESCRIPTION },
            { name: 'keywords', content: USE_CASES_REWARD_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: USE_CASES_REWARD_TAGS.TITLE },
            { name: 'twitter:description', content: USE_CASES_REWARD_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: USE_CASES_REWARD_TAGS.TITLE },
            { property: 'og:title', content: USE_CASES_REWARD_TAGS.TITLE },
            { property: 'og:description', content: USE_CASES_REWARD_TAGS.DESCRIPTION },
            { property: 'og:type', content: USE_CASES_REWARD_TAGS.OG_TYPE },
            { property: 'og:site_name', content: USE_CASES_REWARD_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: USE_CASES_REWARD_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.USE_CASES_REWARD }],
    },
    components: {
        'base-testimonials': BaseTestimonials,
        'base-partners': BasePartners,
        'base-use-cases': BaseUseCases,
        'base-use-case-contact': BaseUseCaseContact,
        'base-contact': BaseContact,
    },
})
export default class BoostEngagementInYourCommunity extends Vue {}
</script>
