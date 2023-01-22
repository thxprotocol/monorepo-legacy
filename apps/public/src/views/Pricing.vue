<template>
    <section class="pt-5">
        <div class="container pt-5 pb-5 container-pricing-max-height">
            <div class="row">
                <div class="col-md-12 text-center">
                    <div class="mt-sm-5">
                        <div class="lead">Transparent</div>
                        <h1 class="h1 font-size-xl mt-3 mb-3">Pricing</h1>
                    </div>
                </div>
            </div>
            <div class="row mt-3 mt-sm-5 justify-content-center">
                <div class="col-md-4 col-lg-3 mb-5 mb-lg-0">
                    <b-card class="h-100" bg-variant="secondary" body-class="p-sm-4">
                        <div class="text-center">
                            <h2 class="h3 text-uppercase font-weight-bold text-dark">Basic</h2>
                            <p class="font-weight-light">No-code customer loyalty and crypto perks</p>
                            <p class="pricing-costs mt-4">
                                <strong>&euro; 0</strong>
                                / month
                            </p>
                            <p>
                                <i
                                    ><a href="https://docs.thx.network/pricing" target="_blank" class="text-muted mt-2">
                                        2,5% transaction fee
                                    </a></i
                                >
                            </p>
                            <b-button
                                block
                                to="/signup"
                                variant="primary"
                                class="rounded-pill mt-3 mb-3"
                                :title="TITLES.PRICING_SIGN_UP"
                            >
                                Sign Up
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                        <h3 class="text-dark font-small mt-5">Features</h3>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Loyalty Widget
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Point Rewards
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Create Coins &amp; NFTs
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Import Coins
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Free transactions
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Webhooks
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-minus icon-circle icon-circle-opaque d-inline-flex"> </i>
                            REST API Access
                        </div>
                    </b-card>
                </div>
                <div class="col-md-4 col-lg-3 mb-5 mb-lg-0">
                    <b-card class="h-100" bg-variant="dark" body-class="text-light p-sm-4">
                        <div class="text-center">
                            <h2 class="h3 text-uppercase font-weight-bold">Premium</h2>
                            <p class="font-weight-light">Integrated loyalty solutions for high traffic platforms</p>
                            <p class="pricing-costs mt-4">
                                <strong>Custom</strong>
                            </p>
                            <p>
                                <i
                                    ><a href="https://docs.thx.network/pricing" target="_blank" class="text-muted mt-2">
                                        2,5% transaction fee
                                    </a></i
                                >
                            </p>
                            <b-button
                                block
                                to="/contact"
                                variant="primary"
                                class="rounded-pill mt-3 mb-3"
                                :title="TITLES.CONTACT_US"
                            >
                                Contact us
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                            <p class="small">
                                <i class="text-muted mt-2">* we accept crypto and EUR or USD payments</i>
                            </p>
                        </div>
                        <h3 class="text-light font-small">Features</h3>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Loyalty Widget
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Point Rewards
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Create Coins &amp; NFTs
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Import Coins
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Free transactions
                        </div>
                        <div class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            Webhooks
                        </div>
                        <div target="topright" class="mb-1">
                            <i class="fas fa-check p-1 icon-circle icon-circle-dark d-inline-flex"> </i>
                            REST API Access
                        </div>
                    </b-card>
                </div>
            </div>
        </div>
        <base-features />
        <base-partners />
        <base-contact :dark="true" />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseJumbotron from '@thxnetwork/public/components/BaseJumbotron.vue';
import BaseFeatures from '@thxnetwork/public/components/BaseFeatures.vue';
import BasePartners from '@thxnetwork/public/components/BasePartners.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import { BButton, BModal } from 'bootstrap-vue';
import { PRICING_TAGS, TWITTER_TAGS, LINKS, TITLES } from '@thxnetwork/public/utils/constants';

@Component({
    metaInfo: {
        title: PRICING_TAGS.TITLE,
        meta: [
            { name: 'title', content: PRICING_TAGS.TITLE },
            { name: 'description', content: PRICING_TAGS.DESCRIPTION },
            { name: 'keywords', content: PRICING_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: PRICING_TAGS.TITLE },
            { name: 'twitter:description', content: PRICING_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: PRICING_TAGS.TITLE },
            { property: 'og:title', content: PRICING_TAGS.TITLE },
            { property: 'og:description', content: PRICING_TAGS.DESCRIPTION },
            { property: 'og:type', content: PRICING_TAGS.OG_TYPE },
            { property: 'og:site_name', content: PRICING_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: PRICING_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.PRICING }],
    },
    components: {
        'b-button': BButton,
        'b-modal': BModal,
        'base-jumbotron': BaseJumbotron,
        'base-contact': BaseContact,
        'base-partners': BasePartners,
        'base-features': BaseFeatures,
    },
})
export default class Home extends Vue {
    perYear = true;
    TITLES = TITLES;
}
</script>
