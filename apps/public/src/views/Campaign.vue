<template>
    <section class="pt-10">
        <b-jumbotron v-lazy:background-image="backgroundImage" class="bg-jumbo mb-5">
            <div class="container pb-5 text-center text-white">
                <div v-if="!campaign" class="col-md-12 justify-content-center d-flex">
                    <b-spinner variant="light" />
                </div>
                <div v-else>
                    <div
                        v-if="campaign.progress > 0"
                        v-b-tooltip
                        :title="`Expires at ${format(new Date(campaign.expiryDate), 'dd-MM-yyyy HH:mm')}`"
                        class="d-flex mb-3"
                    >
                        <i class="fas fa-clock text-muted"></i>
                        <b-progress class="flex-grow-1 ml-3">
                            <b-progress-bar :value="campaign.progress" :max="100" variant="gray"></b-progress-bar>
                        </b-progress>
                    </div>

                    <b-img v-if="campaign.logoImgUrl" class="rounded campaign-logo" :src="campaign.logoImgUrl" />

                    <div>
                        <div class="lead">
                            {{ campaign.title }}
                            <i v-if="!campaign.active" class="fas fa-check-circle text-success"></i>
                        </div>
                    </div>
                    <div><i class="fas fa-users mr-1"></i> {{ campaign.participants }} participants</div>
                    <div class="pb-1">
                        <b-badge :key="key" v-for="(tag, key) of campaign.tags" variant="primary" class="mr-1">
                            {{ tag }}
                        </b-badge>
                    </div>

                    <b-button
                        target="_blank"
                        :href="campaign.domain"
                        class="rounded-pill pr-3 float-right"
                        variant="success"
                    >
                        <i class="fas fa-link mr-1"></i> Visit Campaign
                    </b-button>
                </div>
            </div>
        </b-jumbotron>
        <b-container v-if="campaign">
            <b-row>
                <b-col md="6">
                    <h2>Earn</h2>
                    <b-list-group>
                        <b-list-group-item
                            :key="key"
                            v-for="(r, key) of campaign.rewards"
                            class="d-flex align-items-center justify-content-between"
                        >
                            {{ r.title }}
                            <b-badge variant="dark">{{ r.amount }} </b-badge>
                        </b-list-group-item>
                    </b-list-group>
                </b-col>
                <b-col md="6">
                    <h2>Shop</h2>
                    <b-list-group>
                        <b-list-group-item
                            :key="key"
                            v-for="(r, key) of campaign.perks"
                            class="d-flex align-items-center justify-content-between"
                        >
                            {{ r.title }}
                            <b-badge variant="dark">{{ r.amount }} </b-badge>
                        </b-list-group-item>
                    </b-list-group>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import { INTEGRATIONS_TAGS, TWITTER_TAGS, ALT_TEXT, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import axios from 'axios';
import { API_URL } from '../config/secrets';
import { TCampaign } from '@thxnetwork/types/interfaces';
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
    campaign: TCampaign | null = null;
    backgroundImage = require('../../public/assets/img/thx_jumbotron_token_bg.webp');

    async mounted() {
        const res = await axios.get(API_URL + '/v1/pools/public/' + this.$route.params.id);
        this.campaign = res.data;
        this.backgroundImage = res.data.backgroundImgUrl ? res.data.backgroundImgUrl : this.backgroundImage;
    }
}
</script>
<style lang="scss">
.campaign-logo {
    height: auto;
    max-height: 100px;
    max-width: 200px;
}

.bg-jumbo {
    background-size: cover;
    background-position: center center;
}
</style>
