<template>
    <section class="pt-5">
        <div class="container pb-5 pt-5 mt-5">
            <div class="row">
                <div class="col-12 text-center">
                    <div class="lead">Active loyalty</div>
                    <h1 class="h1 font-size-xl mt-3 mb-3">Campaigns</h1>
                </div>
            </div>
        </div>
        <div class="container pb-5">
            <div class="row pb-5">
                <div class="col-lg-4" :key="key" v-for="(campaign, key) of campaigns">
                    <b-card variant="light" class="mb-4">
                        <div class="d-flex mb-3">
                            <i
                                class="fas fa-clock text-muted"
                                v-b-tooltip
                                :title="`Expires at ${format(new Date(campaign.expiryDate), 'dd-MM-yyyy HH:mm')}`"
                            ></i>
                            <b-progress class="flex-grow-1 ml-3">
                                <b-progress-bar :value="campaign.progress" :max="100" variant="gray"></b-progress-bar>
                            </b-progress>
                        </div>
                        <div class="d-flex">
                            <b-media>
                                <template v-if="campaign.logoImgUrl" #aside>
                                    <b-img
                                        width="75"
                                        height="75"
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
                                <div><i class="fas fa-users mr-1"></i> {{ campaign.participants }} participants</div>
                                <div class="pb-1">
                                    <b-badge :key="key" v-for="(tag, key) of campaign.tags" variant="dark" class="mr-1">
                                        {{ tag }}
                                    </b-badge>
                                </div>
                            </b-media>
                        </div>
                        <template #footer>
                            <b-button :href="campaign.domain" class="rounded-pill" variant="light" size="sm">
                                <i class="fas fa-link mr-1"></i> Visit Campaign
                            </b-button>
                        </template>
                    </b-card>
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
import axios from 'axios';
import { API_URL } from '../config/secrets';
import { ChainId } from '@thxnetwork/sdk/types/enums/ChainId';
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
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
    format = format;

    campaigns = [
        {
            title: 'THX Network',
            expiryDate: new Date(),
            address: '',
            chainId: ChainId.Hardhat,
            logoImgUrl: 'https://localhost:8081/img/logo.svg',
            backgroundImgUrl: 'https://picsum.photos/900/250/?image=3',
            tags: ['Gaming', 'Web3'],
            domain: 'https://www.example.com',
            participants: 23,
            active: false,
            progress: 10,
        },
    ];

    async mounted() {
        const res = await axios.get(API_URL + '/v1/pools/public');
        this.campaigns = res.data;
    }
}
</script>
