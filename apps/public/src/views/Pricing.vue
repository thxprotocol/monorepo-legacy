<template>
    <section class="pt-5">
        <div class="container pt-5 pb-5 section-pricing">
            <div class="row">
                <div class="col-md-12 text-center">
                    <div class="mt-sm-5 mb-5">
                        <h1 class="h1 font-size-xl mt-3 mb-3">Choose Your Plan</h1>
                        <div class="lead">
                            Start with a 14-day free trial, <strong>no credit card required</strong>.<br />
                            <span class="text-muted small">
                                Like it? Pay in crypto, credit card, Google + Apple Pay or SEPA transfer.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3 mt-sm-5 justify-content-center">
                <div class="col-md-4 col-lg-3 mb-5 mb-lg-0">
                    <b-card class="h-100" bg-variant="light" body-class="p-sm-4">
                        <div class="text-center">
                            <h2 class="h3 text-uppercase font-weight-bold text-dark">Lite</h2>
                            <p class="font-weight-light">Best for growth hackers and marketers</p>
                            <p class="pricing-costs mt-4">
                                <strong>&euro; 19</strong>
                                / month
                            </p>
                            <b-button
                                block
                                to="/signup?signup_plan=0"
                                variant="dark"
                                class="rounded-pill mt-3 mb-3"
                                :title="TITLES.PRICING_SIGN_UP"
                            >
                                Start <strong>free</strong> trial
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                    </b-card>
                </div>

                <div class="col-md-4 col-lg-3 mb-5 mb-lg-0">
                    <b-card
                        class="h-100 shadow-lg card-popular"
                        bg-variant="secondary"
                        header-class="text-center"
                        body-class="p-sm-4"
                    >
                        <template #header>
                            <b-badge variant="primary" class="p-2">POPULAR</b-badge>
                        </template>
                        <div class="text-center text-dark">
                            <h2 class="h3 text-uppercase font-weight-bold text-dark">Premium</h2>
                            <p class="font-weight-light">Best for growth teams and game studios</p>
                            <p class="pricing-costs mt-4">
                                <strong>&euro; 489</strong>
                                / month
                            </p>
                            <b-button
                                block
                                to="/signup?signup_plan=1"
                                variant="primary"
                                class="rounded-pill mt-3 mb-3"
                                :title="TITLES.PRICING_SIGN_UP"
                            >
                                Start <strong>free</strong> trial
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                    </b-card>
                </div>
            </div>
            <div class="row mt-md-5 justify-content-center px-5 customers">
                <div class="col-md-12 text-center text-muted pt-md-5 pb-3">
                    <div>Trusted by</div>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://www.ape.bond" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-apebond.png')"
                            width="100"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://gala.com" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-gala.png')"
                            width="120"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://www.forestknight.io" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-forest-knight.png')"
                            width="120"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://www.thedustland.com" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-dustland.png')"
                            width="120"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://titanborn.gg" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-titanborn.png')"
                            width="100"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
            </div>
            <div class="row mt-3 mt-sm-5 justify-content-center">
                <div class="col-md-10 col-lg-10 mb-5 mb-lg-0">
                    <b-card class="bg-light shadow-lg" body-class="p-0">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Lite</th>
                                        <th>
                                            Premium
                                            <b-badge variant="primary" class="p-2">POPULAR</b-badge>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td></td>
                                        <td><strong>&euro; 19</strong></td>
                                        <td><strong>&euro; 489,-</strong></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td class="text-muted small">Best for growth hackers and marketers</td>
                                        <td class="text-muted small">Best for growth teams and game studios</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Smart Wallets<br />
                                            <span class="text-gray small">
                                                Polygon smart contract wallets ideal for non-crypto natives
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Identity & Event API<br />
                                            <span class="text-gray small">
                                                Qualify users for custom quests even before account sign up
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Free Transactions<br />
                                            <span class="text-gray small">
                                                Let us worry about transactions costs and delivery
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Performance Analytics<br />
                                            <span class="text-gray small">
                                                Keep an eye on the performance of your quests
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td class="bg-dark text-white" colspan="4">
                                            <strong>Services</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Dedicated Campaign Manager<br />
                                            <span class="text-gray small">
                                                Opt-in campaign manager during the first three months of your campaign.
                                            </span>
                                        </td>
                                        <td></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Unlimited Technical Support<br />
                                            <span class="text-gray small">
                                                Opt-in technical support for webhook integrations.
                                            </span>
                                        </td>
                                        <td></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td class="bg-dark text-white" colspan="4">
                                            <strong>Integrations</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Discord Bot
                                            <br />
                                            <span class="text-gray small">
                                                Create quests for Discord server activity
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Twitter Automation<br />
                                            <span class="text-gray small">
                                                Automate social quest creation with hashtag filters
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td class="bg-dark text-white" colspan="4">
                                            <strong>Quests</strong>
                                            <b-link
                                                v-b-tooltip
                                                title="Incentivize valuable behavior by letting your players complete quests and earn points."
                                                class="ml-1"
                                            >
                                                <sup class="fas fa-question-circle text-gray"> </sup>
                                            </b-link>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Daily<br />
                                            <span class="text-gray small">
                                                Provide daily incentives for returning to your website
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <!-- <tr>
                                        <td>
                                            Invite<br />
                                            <span class="text-gray small">
                                                Empower your players to earn points for referrals
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr> -->
                                    <tr>
                                        <td>
                                            Social<br />
                                            <span class="text-gray small">
                                                Create quests for Twitter, Discord, YouTube, Github and Twitch
                                                interactions.
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Web3<br />
                                            <span class="text-gray small">
                                                Use smart contracts to reward a wallet's coin balance or NFT ownership.
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Custom<br />
                                            <span class="text-gray small">
                                                Use outbound webhooks to reward important achievements in your
                                                application
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Gitcoin<br />
                                            <span class="text-gray small">
                                                Fight bots with privacy respecting proof of humanity.
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td class="bg-dark text-white" colspan="4">
                                            <strong>Rewards</strong>
                                            <b-link
                                                v-b-tooltip
                                                title="Use earned points or regular payments to collect rewards."
                                                class="ml-1"
                                            >
                                                <sup class="fas fa-question-circle text-gray"> </sup>
                                            </b-link>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Coin <br />
                                            <span class="text-gray small"> Create rewards for ERC20 contracts </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            NFT
                                            <br />
                                            <span class="text-gray small">
                                                Create rewards for ERC721 or ERC1155 contracts
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Coupon<br />
                                            <span class="text-gray small">
                                                Use your own coupon codes to reward your players with whatever they are
                                                worth.
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Discord Role<br />
                                            <span class="text-gray small">
                                                Use THX Bot to assign Discord Roles in your server to users that buy
                                                this reward.
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Custom<br />
                                            <span class="text-gray small">
                                                Use inbound webhooks to reward with a feature in your application
                                            </span>
                                        </td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            QR Codes<br />
                                            <span class="text-gray small">
                                                Use QR codes to distribute your rewards in offline environments
                                            </span>
                                        </td>
                                        <td></td>
                                        <td><i class="fas fa-check-circle"></i></td>
                                    </tr>
                                    <tr>
                                        <td class="bg-dark text-white" colspan="4">
                                            <strong>Limits</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Monthly Active Participants<br />
                                            <span class="text-gray small">
                                                Monthly active campaign participants (MAP) with at least one quests
                                                completed.
                                            </span>
                                        </td>
                                        <td>100</td>
                                        <td>5000</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Additional Participants<br />
                                            <span class="text-gray small">
                                                Additional costs per month when exceeding the MAP limit.
                                            </span>
                                        </td>
                                        <td>&euro; 0,08</td>
                                        <td>&euro; 0,05</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Team members<br />
                                            <span class="text-gray small">
                                                Add a team members to help manage your campaign.
                                            </span>
                                        </td>
                                        <td>Unlimited</td>
                                        <td>Unlimited</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Monthly Fee
                                            <br />
                                            <span class="text-gray small">
                                                Pay in crypto, credit card, Google + Apple Pay or SEPA transfer.
                                            </span>
                                        </td>
                                        <td><strong>&euro; 19</strong></td>
                                        <td><strong>&euro; 489,-</strong></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <b-button to="/signup?signup_plan=1" variant="primary" class="rounded-pill">
                                                Start <strong>free</strong> trial
                                                <i class="fas fa-chevron-right"></i>
                                            </b-button>
                                        </td>
                                        <td>
                                            <b-button to="/signup?signup_plan=2" variant="primary" class="rounded-pill">
                                                Start <strong>free</strong> trial
                                                <i class="fas fa-chevron-right"></i>
                                            </b-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </b-card>
                </div>
            </div>
            <div class="row mt-md-5 justify-content-center px-5 customers">
                <div class="col-md-12 text-center text-muted pt-md-5 pb-3">
                    <div>Trusted by</div>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://www.ape.bond" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-apebond.png')"
                            width="100"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://gala.com" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-gala.png')"
                            width="120"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://www.forestknight.io" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-forest-knight.png')"
                            width="120"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://www.thedustland.com" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-dustland.png')"
                            width="120"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
                </div>
                <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center">
                    <b-link href="https://titanborn.gg" target="_blank">
                        <b-img
                            :src="require('../../public/assets/img/logo-titanborn.png')"
                            width="100"
                            alt=""
                            class="mx-md-5"
                        />
                    </b-link>
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
<style scoped>
.font-small {
    font-size: 0.9rem;
}
.fa-times-circle {
    color: var(--danger);
}

.fa-check-circle {
    color: var(--success);
}
.table td,
.table th {
    text-align: center;
    vertical-align: middle;
    min-width: 200px;
}
.table th:first-child {
    min-width: 210px;
    width: 50%;
}
.table th {
    padding: 0.75rem 0;
}

.table td:first-child,
.table th:first-child {
    text-align: left;
}

@media (min-width: 768px) {
    .card-popular {
        transform: scale(1.15);
        z-index: 1;
    }
}

.customers img {
    transition: 0.2s filter ease, 0.2s opacity ease;
    filter: grayscale(100%);
    opacity: 0.5;
}
.customers img:hover {
    filter: grayscale(0%);
    opacity: 1;
}
</style>
