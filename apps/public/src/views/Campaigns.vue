<template>
    <section class="pt-10">
        <b-jumbotron v-lazy:background-image="require('../../public/assets/img/thx_jumbotron_token_bg.webp')">
            <b-container class="pb-5">
                <b-row class="pb-5">
                    <div v-if="!campaigns.length" class="col-md-12 justify-content-center d-flex">
                        <b-spinner variant="light" />
                    </div>
                    <b-col lg="4" :key="key" v-for="(campaign, key) of campaigns">
                        <BaseCardCampaign :campaign="campaign" />
                    </b-col>
                </b-row>
            </b-container>
        </b-jumbotron>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
import BaseCardCampaign from '@thxnetwork/public/components/BaseCardCampaign.vue';
import { INTEGRATIONS_TAGS, TWITTER_TAGS, ALT_TEXT, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import { API_URL, WIDGET_URL } from '../config/secrets';
import { TWidget, TCampaign } from '@thxnetwork/types/interfaces';

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
        BaseCardCampaign,
    },
})
export default class Home extends Vue {
    widgetUrl = WIDGET_URL;
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
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

<style>
.card-header {
    overflow: hidden;
    position: relative;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.card-header-content {
    z-index: 1;
    text-align: center;
}
.card-header-bg {
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    background-size: cover;
    z-index: 0;
    filter: blur(8px);
    -webkit-filter: blur(8px);

    * {
        filter: blur(0px);
        -webkit-filter: blur(0px);
    }
}
</style>
