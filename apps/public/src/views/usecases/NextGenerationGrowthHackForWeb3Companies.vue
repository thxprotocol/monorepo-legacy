<template>
    <section>
        <b-jumbotron
            class="large"
            v-lazy:background-image="require('../../../public/assets/img/thx_jumbotron_token_bg.webp')"
        >
            <div class="container">
                <div class="row py-md-5">
                    <div class="brand-intro text-white col-md-5 col-lg-4 order-1 order-md-0">
                        <div>
                            <h1 class="brand-text mb-3" style="font-size: 3rem !important">
                                The next generation growth hack for web3 companies
                            </h1>
                            <p class="lead mb-4">Onboard new users and retain existing ones using tokenized loyalty.</p>
                            <BaseCardSignup />
                            <ul class="list-unstyled mt-3">
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Bring your
                                    own ERC-20
                                </li>
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Or create
                                    your first ERC-20 or NFT
                                </li>
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Pay for
                                    success
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-7 col-lg-8 pb-5 py-md-5 order-0 order-md-1">
                        <img v-lazy="require('../../../public/assets/img/thx_jumbotron_apps.png')" class="img-fluid" />
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
                    <img
                        v-lazy="require('../../../public/assets/img/thx_logo_womentech.png')"
                        width="150"
                        class="img-fluid"
                    />
                </div>
                <div
                    class="col-lg-3 pb-5 p-md-0 d-flex justify-content-start justify-content-md-center align-items-center"
                >
                    <img
                        v-lazy="require('../../../public/assets/img/thx_logo_undp.png')"
                        width="110"
                        class="img-fluid"
                    />
                </div>
                <div
                    class="col-lg-3 pb-3 p-md-0 d-flex justify-content-start justify-content-md-center align-items-center"
                >
                    <img
                        v-lazy="require('../../../public/assets/img/thx_logo_novacreed.png')"
                        width="250"
                        class="img-fluid"
                    />
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
            <div class="row pt-5 pt-lg-5 pb-lg-10 pb-5">
                <div class="col-lg-5 offset-lg-1 pb-3">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Integration</h2>
                        <p class="lead mb-2">Low-code loyalty widget</p>
                    </div>
                    <p class="lead">
                        Include a small JavaScript snippet and benefit from a full gamification suite right in your
                        website. Just copy/paste, configure your rewards and you're up and running in 30 minutes.
                    </p>
                    <img v-lazy="require('../../../public/assets/img/thx_widget_launcher.png')" class="img-fluid" />
                </div>
                <div class="col-lg-5 offset-lg-1 pt-10">
                    <div class="text-muted font-weight-bold mb-2">Embed a personalized script tag</div>
                    <pre
                        class="rounded p-3 mb-2 w-100 text-white"
                        style="background-color: #282c34; white-space: pre-line"
                    >
                        <code class="language-common" v-html="codeExample2"></code>
                    </pre>
                    <div class="text-muted font-weight-bold mb-2">Or use our JavaScript SDK</div>
                    <pre class="rounded p-3 w-100 text-white" style="background-color: #282c34; white-space: pre-line">
                        <code class="language-common" v-html="codeExample"></code>
                    </pre>
                </div>
            </div>
        </div>
        <base-metrics />
        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5">
                <div class="col-lg-6 pb-3 text-center">
                    <img v-lazy="require('../../../public/assets/img/thx_widget_rewards.png')" class="img-fluid" />
                </div>
                <div class="col-lg-5 offset-lg-1 pt-5">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Point Configuration</h2>
                        <p class="lead mb-4 font-size-l">Reward user activity and engagement</p>
                    </div>
                    <p class="lead">
                        A number of reward variations offer incentives for important social or in-app touchpoints.
                        Completing multiple rewards allows your users and community members to level up!
                    </p>
                    <ul class="list-unstyled">
                        <li class="pb-2 font-weight-bold lead">
                            <i class="fas fa-comments text-success mr-2"></i> Referral rewards
                        </li>
                        <li class="pb-2 font-weight-bold lead">
                            <i class="fas fa-flag text-success mr-2"></i> Milestone Rewards
                        </li>
                        <li class="pb-2 font-weight-bold lead">
                            <i class="fas fa-trophy text-success mr-2"></i> Conditional Rewards
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5">
                <div class="col-lg-5 offset-lg-1 pt-5">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Perk Configuration</h2>
                        <p class="lead mb-4 font-size-l">Redeem points for perks</p>
                    </div>
                    <p class="lead">
                        Create new or bring your own ERC-20 and build new NFT collections. Configure perks for the
                        assets you create or import.
                    </p>
                    <ul class="list-unstyled">
                        <li class="pb-2 lead"><i class="fas text-primary mr-2 fa-coins"></i> Your coin perks</li>
                        <li class="pb-2 lead"><i class="fas text-primary mr-2 fa-palette"></i> Your NFT perks</li>
                        <li class="pb-2 lead">
                            <i class="fas text-primary mr-2 fa-ticket-alt"></i> Free $THX Lottery Ticket perk
                        </li>
                    </ul>
                </div>
                <div class="col-lg-6 pb-3 text-center">
                    <img v-lazy="require('../../../public/assets/img/thx_widget_perks.png')" class="img-fluid" />
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row pt-5 pt-lg-10 pb-5 pb-lg-10">
                <div class="col-lg-6 pb-3 text-center">
                    <img v-lazy="require('../../../public/assets/img/thx_widget_lottery.png')" class="img-fluid" />
                </div>
                <div class="col-lg-5 offset-lg-1 pt-5">
                    <div class="pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">Free Lottery Perk</h2>
                        <p class="lead mb-4 font-size-l">Weekly THX Lottery</p>
                    </div>
                    <p class="lead">
                        Keep your users active by offering them an opt-in tokenized lottery. Every week $THX tokens are
                        awarded to three lucky winners. Users and community members need to check back in to claim their
                        prize.
                    </p>
                    <ul class="list-unstyled">
                        <li class="pb-2 lead">
                            <span class="fa fa-check text-success mr-2"></span> Prize pool of 2500 $THX
                        </li>
                        <li class="pb-2 lead">
                            <span class="fa fa-check text-success mr-2"></span> Awarded to 3 random wallets
                        </li>
                        <li class="pb-2 lead">
                            <span class="fa fa-check text-success mr-2"></span> Runs on a weekly basis
                        </li>
                    </ul>
                    <p class="lead">Additional lottery tickets can be purchased by completing in-app actions.</p>
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
                            <p class="lead mb-4 font-size-l">Why marketers ❤️ loyalty programs</p>
                        </div>
                        <ul class="list-unstyled">
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> Much lower users acquisition costs than
                                other channels
                            </li>
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> Friends referring friends means high % of
                                engaged users
                            </li>
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> Level up your most loyal users and
                                members to brand champions
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
                        Rewards earned with blockchain powered loyalty can easily be shared across technology platforms
                        both inside and outside of your organization or online community. This includes sharing through
                        online links and even offline using QR-codes. Access, share and trade your tokenized perks
                        anywhere!
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
import BaseUseCases from '@thxnetwork/public/components/BaseUseCases.vue';
import BaseFeatures from '@thxnetwork/public/components/BaseFeatures.vue';
import BaseTestimonials from '@thxnetwork/public/components/BaseTestimonials.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseUseCaseContact from '@thxnetwork/public/components/BaseUseCaseContact.vue';
import BaseCardSignup from '@thxnetwork/public/components/BaseCardSignup.vue';
import { USE_CASES_BOOST_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

hljs.registerLanguage('javascript', JavaScript);
hljs.registerLanguage('xml', Xml);

@Component({
    components: {
        BaseCardSignup,
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
