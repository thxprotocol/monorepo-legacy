<template>
    <section class="pt-10">
        <b-jumbotron v-lazy:background-image="require('../../public/assets/img/thx_jumbotron_token_bg.webp')">
            <div class="container pb-5">
                <div class="row pb-5">
                    <div v-if="!campaigns.length" class="col-md-12 justify-content-center d-flex">
                        <b-spinner variant="light" />
                    </div>
                    <div class="col-lg-4" :key="key" v-for="(campaign, key) of campaigns">
                        <b-card class="bg-darker text-white mb-4" footer-class="justify-content-end d-flex">
                            <div
                                v-if="campaign.progress > 0"
                                v-b-tooltip
                                :title="`Expires at ${format(new Date(campaign.expiryDate), 'dd-MM-yyyy HH:mm')}`"
                                class="d-flex mb-3"
                            >
                                <i class="fas fa-clock text-muted"></i>
                                <b-progress class="flex-grow-1 ml-3">
                                    <b-progress-bar
                                        :value="campaign.progress"
                                        :max="100"
                                        variant="gray"
                                    ></b-progress-bar>
                                </b-progress>
                            </div>
                            <div class="d-flex">
                                <b-media>
                                    <template v-if="campaign.logoImgUrl" #aside>
                                        <b-img
                                            width="75"
                                            height="auto"
                                            class="rounded"
                                            style="margin-right: 1.25rem"
                                            :src="campaign.logoImgUrl"
                                        />
                                    </template>
                                    <div>
                                        <strong>
                                            {{ campaign.title }}
                                            <i v-if="campaign.active" class="fas fa-check-circle text-success"></i>
                                        </strong>
                                    </div>
                                    <div>
                                        <i class="fas fa-users mr-1"></i> {{ campaign.participants }} participants
                                    </div>
                                    <!-- <div class="pb-1">
                                        <b-badge
                                            :key="key"
                                            v-for="(tag, key) of campaign.tags"
                                            variant="primary"
                                            class="mr-1"
                                        >
                                            {{ tag }}
                                        </b-badge>
                                    </div> -->
                                </b-media>
                            </div>
                            <template #footer>
                                <b-button
                                    :href="campaign.domain"
                                    target="_blank"
                                    class="rounded-pill pr-3"
                                    variant="darker"
                                    size="sm"
                                >
                                    <i class="fas fa-question mr-1"></i> More info
                                </b-button>
                                <b-button
                                    :href="`${widgetUrl}/${campaign._id}`"
                                    target="_blank"
                                    class="rounded-pill pr-3"
                                    variant="darker"
                                    size="sm"
                                >
                                    <i class="fas fa-link mr-1"></i> Visit Campaign
                                </b-button>
                            </template>
                        </b-card>
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <!-- <base-contact :dark="true" /> -->
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import { INTEGRATIONS_TAGS, TWITTER_TAGS, ALT_TEXT, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import axios from 'axios';
import { API_URL, WIDGET_URL } from '../config/secrets';
import { TWidget, TCampaign } from '@thxnetwork/types/interfaces';
import { format } from 'date-fns';

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
        'base-contact': BaseContact,
    },
})
export default class Home extends Vue {
    widgetUrl = WIDGET_URL;
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
    format = format;
    campaigns: TCampaign[] = [];

    async mounted() {
        const res = await axios.get(API_URL + '/v1/pools/public');
        this.campaigns = res.data
            .sort((a: TWidget, b: TWidget) => {
                return Number(b.active) - Number(a.active);
            })
            .filter((c) => c.participants > 0);
    }
}
</script>
