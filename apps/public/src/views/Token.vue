<template>
    <div class="page-token">
        <base-token-jumbotron />
        <!-- <base-token-subscribe /> -->
        <base-token-contract />
        <base-token-distribution />
        <base-token-benefits />
        <base-token-circulation />
        <base-team />
        <!-- <div class="container">
            <div class="row">
                <div class="col-lg-6 offset-lg-3 text-center">
                    <base-use-case-contact />
                </div>
            </div>
        </div> -->
        <base-partners />
        <base-contact :dark="true" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BButton } from 'bootstrap-vue';
import BaseJumbotronTokenLaunch from '@thxnetwork/public/components/token/BaseJumbotronTokenLaunch.vue';
import BaseTokenLaunchSubscribe from '@thxnetwork/public/components/token/BaseTokenLaunchSubscribe.vue';
import BaseTokenContract from '@thxnetwork/public/components/token/BaseTokenContract.vue';
import BaseTokenDistribution from '@thxnetwork/public/components/token/BaseTokenDistribution.vue';
import BaseTokenBenefits from '@thxnetwork/public/components/token/BaseTokenBenefits.vue';
import BaseTokenCirculation from '@thxnetwork/public/components/token/BaseTokenCirculation.vue';
import BaseUseCaseContact from '@thxnetwork/public/components/BaseUseCaseContact.vue';
import BasePartners from '@thxnetwork/public/components/BasePartners.vue';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseTeam from '@thxnetwork/public/components/BaseTeam.vue';
import { TOKEN_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

@Component({
    metaInfo: {
        title: TOKEN_TAGS.TITLE,
        meta: [
            { name: 'title', content: TOKEN_TAGS.TITLE },
            { name: 'description', content: TOKEN_TAGS.DESCRIPTION },
            { name: 'keywords', content: TOKEN_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: TOKEN_TAGS.TITLE },
            { name: 'twitter:description', content: TOKEN_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: TOKEN_TAGS.TITLE },
            { property: 'og:title', content: TOKEN_TAGS.TITLE },
            { property: 'og:description', content: TOKEN_TAGS.DESCRIPTION },
            { property: 'og:type', content: TOKEN_TAGS.OG_TYPE },
            { property: 'og:site_name', content: TOKEN_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: TOKEN_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.TOKEN }],
    },
    components: {
        'b-button': BButton,
        'base-token-jumbotron': BaseJumbotronTokenLaunch,
        'base-token-subscribe': BaseTokenLaunchSubscribe,
        'base-token-contract': BaseTokenContract,
        'base-token-distribution': BaseTokenDistribution,
        'base-token-benefits': BaseTokenBenefits,
        'base-token-circulation': BaseTokenCirculation,
        'base-team': BaseTeam,
        'base-contact': BaseContact,
        'base-partners': BasePartners,
        'base-use-case-contact': BaseUseCaseContact,
    },
})
export default class Token extends Vue {}
</script>
