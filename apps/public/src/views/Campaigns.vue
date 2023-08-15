<template>
    <div class="page-campaigns">
        <b-jumbotron class="bg-light">
            <div class="container">
                <div class="row py-md-5">
                    <div class="brand-intro col-lg-4 order-1 order-md-0">
                        <div>
                            <h1 class="brand-text mb-3">
                                Campaign<br />
                                Discovery
                            </h1>
                            <p class="lead mb-4">
                                A single spot to discover all Quest &amp; Reward campaigns that you can participate in.
                            </p>
                            <b-form id="formSignupRedirect" class="row">
                                <div class="col-12">
                                    <b-alert show variant="info">
                                        <i class="fas fa-clock mr-2"></i>
                                        <b-link
                                            target="_blank"
                                            class="text-dark"
                                            href="https://discord.com/invite/u3DruB5pm5"
                                        >
                                            Join our Discord to receive updates the release!
                                            <i class="fas fa-chevron-right ml-2" style="font-size: 0.8rem"></i>
                                        </b-link>
                                    </b-alert>
                                </div>
                            </b-form>
                        </div>
                    </div>
                    <div class="col-lg-5 order-0 order-md-1 offset-lg-3 text-center">
                        <b-img
                            v-lazy="require('../../public/assets/img/thx_token_governance.webp')"
                            alt=""
                            class="img-fluid mb-3"
                        />
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <section class="mt-5 pb-5">
            <div class="container">
                <div class="row pb-5">
                    <div class="col-lg-12">
                        <h5 class="mb-4">The numbers</h5>
                    </div>
                    <div class="col-lg-4">
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Users</span>
                            <strong>13858</strong>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Quests Completed</span>
                            <strong>11013</strong>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Rewards Earned</span>
                            <strong>875</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <BasePartners />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TOKEN_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';
import BasePartners from '@thxnetwork/public/components/BasePartners.vue';
import BaseMetrics from '../components/BaseMetrics.vue';

@Component({
    metaInfo: {
        title: TOKEN_TAGS.TITLE,
        meta: [
            { name: 'title', content: TOKEN_TAGS.TITLE },
            { name: 'description', content: TOKEN_TAGS.DESCRIPTION },
            { name: 'keywords', content: TOKEN_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: TOKEN_TAGS.TITLE },
            { name: 'twitter:description', content: TOKEN_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: TOKEN_TAGS.TITLE },
            { property: 'og:title', content: TOKEN_TAGS.TITLE },
            { property: 'og:description', content: TOKEN_TAGS.DESCRIPTION },
            { property: 'og:type', content: TOKEN_TAGS.OG_TYPE },
            { property: 'og:site_name', content: TOKEN_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: TOKEN_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.TOKEN }],
    },
    components: {
        BaseMetrics,
        BasePartners,
    },
})
export default class Token extends Vue {}
</script>
