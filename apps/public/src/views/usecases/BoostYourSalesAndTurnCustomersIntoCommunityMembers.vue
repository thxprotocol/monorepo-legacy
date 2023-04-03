<template>
    <section>
        <b-jumbotron class="large" v-lazy:background-image="require('../../../public/assets/img/thx_jumbotron_bg.jpg')">
            <div class="container">
                <div class="row">
                    <div class="brand-intro text-white col-md-5 col-lg-4 order-1 order-md-0">
                        <div>
                            <h1 class="brand-text mb-3" style="font-size: 3rem !important">
                                Boost your sales and make your customers loyal members
                            </h1>
                            <p class="lead mb-4">Paid loyalty programs for ecommerce companies and marketers.</p>
                            <BaseCardSignup />
                            <ul class="list-unstyled mt-3">
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Perfect for
                                    Shopify
                                </li>
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> 30 minutes or
                                    less to set up
                                </li>
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Made in
                                    Amsterdam
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-7 col-lg-8 order-0 order-md-1">
                        <img
                            v-lazy="require('../../../public/assets/img/thx_jumbotron_commerce.png')"
                            class="img-fluid"
                        />
                    </div>
                </div>
            </div>
        </b-jumbotron>

        <div class="container pt-5 pb-4">
            <div class="row">
                <div class="col-lg-9 offset-lg-2 text-left text-md-center">
                    <p class="font-weight-bold text-uppercase text-gray">
                        70.000+ transactions completed for our customers
                    </p>
                </div>
            </div>
            <div class="row">
                <div
                    class="col-lg-3 pb-3 p-md-0 offset-lg-2 d-flex justify-content-start justify-content-md-center align-items-center"
                >
                    <img v-lazy="require('../../../public/assets/img/logo-ideal.svg')" width="75" class="img-fluid" />
                </div>
                <div
                    class="col-lg-3 pb-5 p-md-0 d-flex justify-content-start justify-content-md-center align-items-center"
                >
                    <img
                        v-lazy="require('../../../public/assets/img/logo-shopify.svg')"
                        width="175"
                        class="img-fluid"
                    />
                </div>
                <div
                    class="col-lg-3 pb-3 p-md-0 d-flex justify-content-start justify-content-md-center align-items-center"
                >
                    <img v-lazy="require('../../../public/assets/img/logo-cc.png')" width="200" class="img-fluid" />
                </div>
            </div>
            <div class="row">
                <div class="col-lg-9 offset-lg-2 text-left text-md-center p-0 pt-3">
                    <ul class="list-unstyled d-md-flex justify-content-center pl-2">
                        <li class="mr-5 text-gray">✓ Bring your own ERC-20</li>
                        <li class="mr-5 text-gray">✓ Or create your first token and NFT's</li>
                        <li class="mr-5 text-gray">✓ Free to try</li>
                    </ul>
                </div>
            </div>
        </div>
        <hr />
        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5">
                <div class="col-lg-6 pb-3 text-center">
                    <img v-lazy="require('../../../public/assets/img/thx_widget_rewards.png')" class="img-fluid" />
                </div>
                <div class="col-lg-5 offset-lg-1 pt-5">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Point Configuration</h2>
                        <p class="lead mb-4 font-size-l">Reward referrals, social activity and purchases</p>
                    </div>
                    <p class="lead">
                        Powerful rewards to attract new shoppers and retain existing ones. Turn customers into community
                        members!
                    </p>
                    <ul class="list-unstyled">
                        <li class="pb-2 font-weight-bold lead">
                            <i class="fas fa-comments text-success mr-2"></i> Referral rewards
                        </li>
                        <li class="pb-2 font-weight-bold lead">
                            <i class="fas fa-trophy text-success mr-2"></i> Conditional Rewards
                        </li>
                        <li class="pb-2 font-weight-bold lead">
                            <i class="fas fa-flag text-success mr-2"></i> Milestone Rewards
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5">
                <div class="col-lg-5 offset-lg-1 pt-5">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Shopify Integration</h2>
                        <p class="lead mb-4 font-size-l">Reward events in your Shopify store</p>
                    </div>
                    <p class="lead">
                        Connect your Shopify Store to set up rewards based on your customer behavior. Reward your
                        customers along their whole customer journey.
                    </p>
                    <ul class="list-unstyled">
                        <li class="pb-2 lead"><span class="fa fa-check text-success mr-2"></span> Order Amount</li>
                        <li class="pb-2 lead"><span class="fa fa-check text-success mr-2"></span> Total Spent</li>
                        <li class="pb-2 lead">
                            <span class="fa fa-check text-success mr-2"></span> Newsletter Subscription
                        </li>
                    </ul>
                    <!-- <p class="lead">Additional lottery tickets can be purchased by completing in-app actions.</p> -->
                </div>
                <div class="col-lg-6 pb-3 text-center">
                    <img v-lazy="require('../../../public/assets/img/thx_widget_lottery.png')" class="img-fluid" />
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5 pb-lg-10">
                <div class="col-lg-6 pb-3 text-center">
                    <img v-lazy="require('../../../public/assets/img/thx_widget_perks.png')" class="img-fluid" />
                </div>
                <div class="col-lg-5 offset-lg-1 pt-5">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Perk Configuration</h2>
                        <p class="lead mb-4 font-size-l">Customers exchange cash or points for perks</p>
                    </div>
                    <p class="lead">
                        Customers spend their loyalty points on various perks such as digital collectibles and coins.
                        You can even sell collectibles giving you new revenue streams!
                    </p>
                    <ul class="list-unstyled">
                        <li class="pb-2 lead">
                            <i class="fas text-primary mr-2 fa-coins"></i> Create your own loyalty coin
                        </li>
                        <li class="pb-2 lead">
                            <i class="fas text-primary mr-2 fa-palette"></i> Give badges to loyal customers
                        </li>
                        <li class="pb-2 lead">
                            <i class="fas text-primary mr-2 fa-ticket-alt"></i> Sell collectibles using iDEAL and credit
                            cards
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <section class="bg-darker text-white">
            <div class="container">
                <div class="row py-5 pb-lg-10 pt-lg-10">
                    <div class="col-lg-6 pb-3 text-center">
                        <img v-lazy="require('../../../public/assets/img/thx_widget_referral.png')" class="img-fluid" />
                    </div>
                    <div class="col-lg-5 offset-lg-1">
                        <div class="pt-5 pt-lg-5 pt-xl-4">
                            <h2 class="h5 text-dark">Loyalty Networks</h2>
                            <p class="lead mb-4 font-size-l">Why marketers ❤️ paid loyalty</p>
                        </div>
                        <ul class="list-unstyled">
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> 43% more likely to increase purchase
                                frequency
                            </li>
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> 62% more likely to spend more than before
                            </li>
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> New revenue source offsets higher
                                customer acquisition costs
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        <div class="container">
            <div class="row pt-5 pb-5">
                <div class="col-lg-6 offset-lg-3 pb-3 text-center">
                    <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Technology</h2>
                        <p class="lead mb-4 font-size-l">Why Blockchain?</p>
                    </div>
                    <p>
                        Rewards earned with blockchain powered loyalty can easily be shared across your ecommerce
                        partners. This includes sharing online and even offline using QR-codes. Access, share and trade
                        your token powered perks anywhere!
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-8 offset-lg-2 text-center">
                    <img
                        class="img-fluid"
                        v-lazy="require('../../../public/assets/img/thx_landing_pulse.webp')"
                        alt=""
                    />
                </div>
            </div>
        </div>
        <div class="container">
            <div class="row">
                <div class="col-lg-6 offset-lg-3 text-center pt-10">
                    <base-use-case-contact />
                </div>
            </div>
        </div>
        <base-contact :dark="true" />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import hljs from 'highlight.js/lib/core';
import JavaScript from 'highlight.js/lib/languages/javascript';
import Xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';
import { DASHBOARD_URL } from '@thxnetwork/public/config/secrets';

import BaseUseCases from '@thxnetwork/public/components/BaseUseCases.vue';
import BaseFeatures from '@thxnetwork/public/components/BaseFeatures.vue';
import BaseTestimonials from '@thxnetwork/public/components/BaseTestimonials.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseUseCaseContact from '@thxnetwork/public/components/BaseUseCaseContact.vue';
import BaseMetrics from '@thxnetwork/public/components/BaseMetrics.vue';
import BaseCardSignup from '@thxnetwork/public/components/BaseCardSignup.vue';
import { USE_CASES_BOOST_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

hljs.registerLanguage('javascript', JavaScript);
hljs.registerLanguage('xml', Xml);

@Component({
    components: {
        BaseCardSignup,
        BaseMetrics,
        BaseFeatures,
        BaseUseCaseContact,
        BaseTestimonials,
        BaseUseCases,
        BaseContact,
    },
    metaInfo: {
        title: USE_CASES_BOOST_TAGS.TITLE,
        meta: [
            { name: 'title', content: USE_CASES_BOOST_TAGS.TITLE },
            { name: 'description', content: USE_CASES_BOOST_TAGS.DESCRIPTION },
            { name: 'keywords', content: USE_CASES_BOOST_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: USE_CASES_BOOST_TAGS.TITLE },
            { name: 'twitter:description', content: USE_CASES_BOOST_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: USE_CASES_BOOST_TAGS.TITLE },
            { property: 'og:title', content: USE_CASES_BOOST_TAGS.TITLE },
            { property: 'og:description', content: USE_CASES_BOOST_TAGS.DESCRIPTION },
            { property: 'og:type', content: USE_CASES_BOOST_TAGS.OG_TYPE },
            { property: 'og:site_name', content: USE_CASES_BOOST_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: USE_CASES_BOOST_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.USE_CASES_BOOST }],
    },
})
export default class BoostEngagementInYourCommunity extends Vue {
    codeExample = hljs.highlight(
        `// app.js
import THXWidget from '@thxnetwork/sdk';

new THXWidget({ poolId: "507f191e810c19729de860ea" });`,
        { language: 'javascript' },
    ).value;
    codeExample2 = hljs.highlight(
        `<!-- index.html -->
<script src="https://api.thx.network/v1/widget/507f191e810c19729de860ea.js"><\/script>`,
        {
            language: 'xml',
        },
    ).value;

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }
}
</script>
