<template>
    <section>
        <b-jumbotron style="min-height: 0;" bg-variant="secondary">
            <div class="container">
                <div class="row pt-5 pt-lg-10 mb-lg-5">
                    <div class="col-lg-8 offset-lg-2 mb-5">
                        <h1 class="brand-text text-center">
                            Play in Business - Submit your use case below 🚀
                        </h1>
                        <img class="img-fluid mb-5" v-lazy="require('../../../public/assets/img/thx_landing_rocket.webp')" alt="" />
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5">
                <div class="col-lg-6 offset-lg-3 pb-3 text-center">
                    <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Gamification-as-a-service</h2>
                        <p class="lead mb-4 font-size-l">
                            6 Months for Free 🎁 <br />
                            (€570 value)
                        </p>
                    </div>
                    <p>
                        Set up loyalty and HR programs, add digital badges or points to your games and much more...
                        People gain a richer experience in your app, website or real life game, boosting their
                        experience and the games' impact. Submit your use case below and we will get right at it! Enjoy
                        6 months of our 'Community'offering for free.
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
        <div class="row">
            <div class="col-lg-6 offset-lg-3 text-center">
                <base-use-case-contact />
            </div>
        </div>
        <base-use-cases />
        <base-contact :dark="true" />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseUseCases from '@thxnetwork/public/components/BaseUseCases.vue';
import BaseTestimonials from '@thxnetwork/public/components/BaseTestimonials.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseUseCaseContact from '@thxnetwork/public/components/BaseUseCaseContact.vue';

const META_TITLE = '';
const META_DESCRIPTION = '';

@Component({
    metaInfo: {
        title: META_TITLE,
        meta: [
            { name: 'title', content: META_TITLE },
            { name: 'description', content: META_DESCRIPTION },
            { name: 'keywords', content: 'play, business' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: META_TITLE },
            { name: 'twitter:description', content: META_DESCRIPTION },
            { name: 'twitter:image:alt', content: META_TITLE },
            { property: 'og:title', content: META_TITLE },
            { property: 'og:description', content: META_DESCRIPTION },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'Play In Business' },
            { property: 'og:url', content: document.location.href },
        ],
    },
    components: {
        'base-use-case-contact': BaseUseCaseContact,
        'base-testimonials': BaseTestimonials,
        'base-use-cases': BaseUseCases,
        'base-contact': BaseContact,
    },
})
export default class PlayInBusiness extends Vue {}
</script>
