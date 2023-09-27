<template>
    <section class="pt-5">
        <div class="container pb-5 pt-5 mt-5">
            <div class="row">
                <div class="col-12 text-center">
                    <div class="lead">Pick your flavour</div>
                    <h1 class="h1 font-size-xl mt-3 mb-3">Solutions</h1>
                </div>
            </div>
        </div>
        <b-tabs align="center" active-nav-item-class="btn-primary rounded-pill" nav-class="bg-light py-3" pills>
            <b-tab>
                <template #title>
                    <i class="fas fa-trophy mr-2"></i>
                    Quests
                </template>
                <BaseRowContent
                    v-for="(feature, key) of quests"
                    :key="key"
                    :content="feature"
                    :img-align="key % 2 === 0 ? 'right' : 'left'"
                />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-gift mr-2"></i>
                    Rewards
                </template>
                <BaseRowContent
                    v-for="(feature, key) of rewards"
                    :key="key"
                    :content="feature"
                    :img-align="key % 2 === 0 ? 'right' : 'left'"
                />
            </b-tab>
        </b-tabs>

        <div class="container pb-5 pt-5 mt-5">
            <div class="row">
                <div class="col-12 text-center">
                    <div class="lead">Many Platform</div>
                    <h1 class="h1 font-size-xl mt-3 mb-3">Integrations</h1>
                </div>
            </div>
        </div>
        <div class="container pb-5">
            <div class="row pb-5">
                <div class="col-lg-6">
                    <img
                        class="img-fluid"
                        :src="require('../../public/assets/img/thx_integrations.webp')"
                        :alt="ALT_TEXT.INTEGRATIONS_THX_INTEGRATIONS"
                    />
                </div>

                <div class="col-lg-4 offset-lg-1 d-flex align-items-center">
                    <div>
                        <p>
                            <strong>THX makes your existing app or online community more engaging.</strong> Using our
                            API you add gamified rewards to your software. We offer a number of integrations listed
                            below but the possibilities are endless.
                        </p>
                        <p>
                            Don't hesitate to reach out to explore your use case. Or contact our team on Slack if you
                            have any questions.
                        </p>
                        <b-button variant="dark" class="rounded-pill" to="/contact" :title="TITLES.CONTACT_US">
                            Contact us <i class="fas fa-chevron-right"></i>
                        </b-button>
                        <b-button
                            variant="link"
                            target="_blank"
                            href="https://thx.page.link/slack"
                            :title="TITLES.INTEGRATIONS_OR_REACH_OUT_ON_SLACK"
                        >
                            Or reach out on Slack
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
            </div>
            <div class="row pt-5 pb-5">
                <div class="col-lg-4 offset-lg-1 d-flex align-items-center order-1 order-lg-0">
                    <div>
                        <h2>Discord Bot</h2>
                        <p>
                            Use the THX bot to reward message authors with points (= ERC-20 tokens from a pool) by
                            reacting with certain emojis on their contributions in a channel.
                        </p>
                        <b-button
                            variant="primary"
                            class="rounded-pill"
                            to="/signup"
                            :title="TITLES.INTEGRATIONS_DISCORD_GET_API_ACCESS"
                        >
                            Get API Access
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                        <b-button
                            variant="link"
                            href="https://top.gg/bot/834083368370700299"
                            target="_blank"
                            :title="TITLES.INTEGRATIONS_DISCORD_VIEW_INTEGRATION"
                        >
                            <img
                                width="20"
                                v-lazy="require('../../public/assets/img/thx_discord.png')"
                                :alt="ALT_TEXT.INTEGRATIONS_THX_DISCORD"
                            />
                            View integration
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
                <div class="col-lg-6 offset-lg-1">
                    <img
                        class="img-fluid mb-5 mb-lg-0"
                        v-lazy="require('../../public/assets/img/thx_integration_discord.webp')"
                        :alt="ALT_TEXT.INTEGRATIONS_THX_DISCORD"
                    />
                </div>
            </div>
            <div class="row pt-5 pb-5">
                <div class="col-lg-6">
                    <img
                        class="img-fluid mb-5 mb-lg-0"
                        v-lazy="require('../../public/assets/img/thx_integration_slack.webp')"
                        :alt="ALT_TEXT.INTEGRATIONS_THX_SLACK"
                    />
                </div>
                <div class="col-lg-4 offset-lg-1 d-flex align-items-center">
                    <div>
                        <h2>Slack App</h2>
                        <p>
                            Use the Slack app to reward workspace members with(= ERC-20 tokens from a pool) by reacting
                            with certain emojis on their contributions in your community.
                        </p>
                        <b-button
                            variant="primary"
                            class="rounded-pill"
                            to="/signup"
                            :title="TITLES.INTEGRATIONS_SLACK_GET_API_ACCESS"
                        >
                            Get API Access
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                        <b-button
                            variant="link"
                            href="https://slack.com/apps/A023F6LEGJ2"
                            target="_blank"
                            :title="TITLES.INTEGRATIONS_SLACK_VIEW_INTEGRATION"
                        >
                            <img
                                width="20"
                                v-lazy="require('../../public/assets/img/thx_slack.png')"
                                :alt="ALT_TEXT.INTEGRATIONS_THX_SLACK"
                            />
                            View integration
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
            </div>
            <div class="row pt-5 pb-5">
                <div class="col-lg-4 offset-lg-1 d-flex align-items-center order-1 order-lg-0">
                    <div>
                        <h2>Drupal Module</h2>
                        <p>
                            Works together with the ‘Rules module’. For example; reward completing your profile and
                            allow your users to spend these points to unlock premium content.
                        </p>
                        <b-button
                            variant="primary"
                            class="rounded-pill"
                            to="/signup"
                            :title="TITLES.INTEGRATIONS_DRUPAL_GET_API_ACCESS"
                        >
                            Get API Access
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                        <b-button
                            variant="link"
                            href="https://www.drupal.org/project/thx"
                            target="_blank"
                            :title="TITLES.INTEGRATIONS_DRUPAL_VIEW_INTEGRATION"
                        >
                            <img
                                width="20"
                                v-lazy="require('../../public/assets/img/thx_drupal.png')"
                                :alt="ALT_TEXT.INTEGRATIONS_THX_DRUPAL"
                            />
                            View integration
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
                <div class="col-lg-6 offset-lg-1">
                    <img
                        class="img-fluid mb-5 mb-lg-0"
                        v-lazy="require('../../public/assets/img/thx_integration_drupal.webp')"
                        :alt="ALT_TEXT.INTEGRATIONS_THX_DRUPAL"
                    />
                </div>
            </div>
        </div>
        <base-contact :dark="true" />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import { INTEGRATIONS_TAGS, TWITTER_TAGS, ALT_TEXT, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import { features } from './UseCaseDetail.vue';
import BaseRowContent from '../components/BaseRowContent.vue';

@Component({
    metaInfo: {
        title: INTEGRATIONS_TAGS.TITLE,
        meta: [
            { name: 'title', content: INTEGRATIONS_TAGS.TITLE },
            { name: 'description', content: INTEGRATIONS_TAGS.DESCRIPTION },
            { name: 'keywords', content: INTEGRATIONS_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: INTEGRATIONS_TAGS.TITLE },
            { name: 'twitter:description', content: INTEGRATIONS_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: INTEGRATIONS_TAGS.TITLE },
            { property: 'og:title', content: INTEGRATIONS_TAGS.TITLE },
            { property: 'og:description', content: INTEGRATIONS_TAGS.DESCRIPTION },
            { property: 'og:type', content: INTEGRATIONS_TAGS.OG_TYPE },
            { property: 'og:site_name', content: INTEGRATIONS_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: INTEGRATIONS_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.INTEGRATIONS }],
    },
    components: {
        BaseContact,
        BaseRowContent,
    },
})
export default class Home extends Vue {
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
    features: any = features;

    get quests() {
        const keys = Object.keys(this.features).filter((key) => key.includes('quest'));
        return keys.map((key) => features[key]);
    }

    get rewards() {
        const keys = Object.keys(this.features).filter((key) => key.includes('reward'));
        return keys.map((key) => features[key]);
    }
}
</script>
