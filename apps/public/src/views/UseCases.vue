<template>
    <section class="bg-darker pt-5">
        <div class="container pb-5 pt-5 mt-5">
            <div class="row">
                <div class="col-md-12 text-center text-white">
                    <div class="lead">We add value</div>
                    <h1 class="h1 font-size-xl mt-3 mb-3">Use cases</h1>
                    <p class="lead font-weight-light">
                        THX is the easiest and most flexible way to embed gamification in your app.
                    </p>
                </div>
            </div>
        </div>
        <div class="container pb-5">
            <div class="row">
                <div class="col-lg-5 offset-lg-1">
                    <b-card bg-variant="darker" text-variant="white" class="border-0">
                        <router-link
                            :to="'/use-cases/onboard-new-players-with-referrals'"
                            :title="TITLES.USECASES_USECASE_ROCKET"
                        >
                            <img
                                class="img-fluid rounded"
                                :src="require('../../public/assets/img/thx_usecase_rocket.webp')"
                                :alt="ALT_TEXT.USECASES_USECASE_ROCKET"
                            />
                        </router-link>
                        <div class="mt-5">Gamification</div>
                        <h3 class="h3 mt-2 font-size-l font-weight-normal">
                            <router-link
                                class="text-white"
                                :to="'/use-cases/onboard-new-players-with-referrals'"
                                :title="TITLES.USECASES_USECASE_ROCKET"
                            >
                                Onboard new players with referrals
                            </router-link>
                        </h3>
                        <b-button
                            variant="link-primary text-secondary pl-0"
                            :to="'/use-cases/boost-engagement-in-your-community'"
                        >
                            Discover more
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </b-card>
                    <b-card bg-variant="darker" text-variant="white" class="border-0">
                        <router-link
                            to="/use-cases/next-generation-growth-hack-for-web3-companies"
                            :title="TITLES.HOME_USECASE_ERC"
                        >
                            <img
                                class="img-fluid rounded"
                                v-lazy="require('../../public/assets/img/thx_usecase_award.webp')"
                                :alt="ALT_TEXT.USECASES_USECASE_BRAIN"
                            />
                        </router-link>
                        <div class="mt-5">Web3</div>
                        <h3 class="h3 mt-2 font-size-l font-weight-normal">
                            <router-link
                                class="text-white"
                                to="/use-cases/next-generation-growth-hack-for-web3-companies"
                                :title="TITLES.HOME_USECASE_ERC"
                            >
                                The next generation growth hack for web3 companies
                            </router-link>
                        </h3>
                        <b-button
                            variant="link-primary text-secondary pl-0"
                            to="/use-cases/next-generation-growth-hack-for-web3-companies"
                        >
                            Discover more
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </b-card>
                </div>
                <div class="col-lg-5 pt-lg-5 mt-lg-5">
                    <b-card bg-variant="darker" text-variant="white" class="border-0">
                        <router-link
                            :to="'/use-cases/boost-your-sales-and-turn-customers-into-community-members'"
                            :title="TITLES.USECASES_USECASE_REWARD"
                        >
                            <img
                                class="img-fluid rounded"
                                :src="require('../../public/assets/img/thx_usecase_brain.webp')"
                                :alt="ALT_TEXT.USECASES_USECASE_AWARD"
                            />
                        </router-link>
                        <div class="mt-5">Engagement</div>
                        <h3 class="h3 mt-2 font-size-l font-weight-normal">
                            <router-link
                                class="text-white"
                                :to="'/use-cases/boost-your-sales-and-turn-customers-into-community-members'"
                                :title="TITLES.USECASES_USECASE_REWARD"
                            >
                                Boost your sales and turn customers into community members
                            </router-link>
                        </h3>
                        <b-button
                            variant="link-primary text-secondary pl-0"
                            :to="'/use-cases/boost-your-sales-and-turn-customers-into-community-members'"
                        >
                            Discover more
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </b-card>
                </div>
            </div>
        </div>
        <div class="container pb-lg-10 pt-lg-10">
            <div class="row bg-circle pb-5 pt-5">
                <div class="col-lg-6 offset-lg-3">
                    <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Integrations</h2>
                        <p class="lead mb-4 font-weight-normal font-italic text-white">
                            Dive in deep and check out our integrations
                        </p>
                        <b-button variant="link" class="text-secondary" :title="TITLES.USECASES_OUR_INTEGRATIONS">
                            Our integrations
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
        <base-contact />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import { USE_CASES_TAGS, TWITTER_TAGS, ALT_TEXT, LINKS, TITLES } from '@thxnetwork/public/utils/constants';

@Component({
    metaInfo: {
        title: USE_CASES_TAGS.TITLE,
        meta: [
            { name: 'title', content: USE_CASES_TAGS.TITLE },
            { name: 'description', content: USE_CASES_TAGS.DESCRIPTION },
            { name: 'keywords', content: USE_CASES_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: USE_CASES_TAGS.TITLE },
            { name: 'twitter:description', content: USE_CASES_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: USE_CASES_TAGS.TITLE },
            { property: 'og:title', content: USE_CASES_TAGS.TITLE },
            { property: 'og:description', content: USE_CASES_TAGS.DESCRIPTION },
            { property: 'og:type', content: USE_CASES_TAGS.OG_URL },
            { property: 'og:site_name', content: USE_CASES_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: USE_CASES_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.USE_CASES }],
    },
    components: {
        'base-contact': BaseContact,
    },
})
export default class Home extends Vue {
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
}
</script>
<style scoped>
h3.mt-2.font-size-l.font-weight-normal a:hover {
    text-decoration: none;
}
</style>
