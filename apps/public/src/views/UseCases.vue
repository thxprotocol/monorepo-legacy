<template>
    <section class="bg-darker pt-5">
        <b-container class="pb-5 pt-5 mt-5">
            <div class="row">
                <div class="col-md-12 text-center text-white">
                    <div class="lead">We add value</div>
                    <h1 class="h1 font-size-xl mt-3 mb-3">Use cases</h1>
                    <p class="lead font-weight-light">
                        THX is the easiest and most flexible way to embed Quests &amp; Rewards in your app.
                    </p>
                </div>
            </div>
        </b-container>
        <b-container class="pb-5">
            <b-row>
                <b-col lg="5" offset-lg="1">
                    <BaseCardUseCase :content="content['titanborn']" />
                    <BaseCardUseCase :content="content['carbify']" />
                    <BaseCardUseCase :content="content['tryhards']" />
                    <BaseCardUseCase :content="content['blind-boxes']" />
                </b-col>
                <b-col lg="5" class="pt-lg-5 mt-lg-5">
                    <BaseCardUseCase :content="content['forest-knight']" />
                    <BaseCardUseCase :content="content['apeswap']" />
                    <BaseCardUseCase :content="content['royal-dutch-mint']" />
                    <BaseCardUseCase :content="content['2tokens']" />
                </b-col>
            </b-row>
        </b-container>
        <b-container class="pb-lg-10 pt-lg-10">
            <div class="row bg-circle pb-5 pt-5">
                <div class="col-lg-6 offset-lg-3">
                    <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                        <h2 class="h5">User guides</h2>
                        <p class="lead mb-4 font-weight-normal font-italic text-white">
                            Dive in deep and check out our user guides
                        </p>
                        <b-button
                            variant="link"
                            class="text-secondary"
                            :title="TITLES.USECASES_OUR_INTEGRATIONS"
                            href="https://docs.thx.network"
                            target="_blank"
                        >
                            Our user guides
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
            </div>
        </b-container>
        <base-contact />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseCardUseCase from '@thxnetwork/public/components/BaseCardUseCase.vue';
import { USE_CASES_TAGS, TWITTER_TAGS, ALT_TEXT, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import { content } from './UseCaseDetail.vue';

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
        BaseCardUseCase,
        BaseContact,
    },
})
export default class Home extends Vue {
    content = content;
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
}
</script>
<style scoped>
h3.mt-2.font-size-l.font-weight-normal a:hover {
    text-decoration: none;
}
</style>
