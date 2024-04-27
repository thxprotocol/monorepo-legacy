<template>
    <section>
        <b-jumbotron
            class="large"
            v-lazy:background-image="require('../../public/assets/img/thx_jumbotron_token_bg.webp')"
        >
            <b-container>
                <b-row class="py-md-5">
                    <b-col md="5" lg="4" order="1" order-md="0 " class="brand-intro text-white">
                        <div>
                            <b-img
                                v-if="content.logo"
                                style="max-width: 200px; height: auto"
                                v-lazy="content.logo"
                                height="100"
                                class="mb-2"
                            />
                            <h1 class="brand-text mb-3">{{ content.title }}</h1>
                            <p class="lead mb-5">
                                {{ content.description }}
                            </p>
                            <BaseCardSignup input-class="bg-darker border-dark text-white" />
                            <ul class="list-unstyled mt-3">
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Immersive
                                    Quests
                                </li>
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> Endless
                                    Rewards
                                </li>
                                <li class="pb-2">
                                    <span class="fa fa-check text-success mr-2" aria-hidden="true"></span> User Friendly
                                    Wallets
                                </li>
                            </ul>
                        </div>
                    </b-col>
                    <b-col md="7" lg="8" order="0" order-md="1 " class="pb-5 py-md-5">
                        <b-card bg-variant="darker">
                            <b-embed type="iframe" aspect="16by9" :src="content.video" allowfullscreen></b-embed>
                        </b-card>
                    </b-col>
                </b-row>
            </b-container>
        </b-jumbotron>

        <BaseRowContent
            :key="key"
            v-for="(feature, key) of content.features"
            :content="feature"
            :img-align="key % 2 === 0 ? 'right' : 'left'"
        />

        <hr />
        <BaseMetrics class="mt-5 pt-5" />

        <section class="bg-darker text-white">
            <div class="container">
                <div class="row py-5 pb-lg-10 pt-lg-10">
                    <div class="col-lg-6 pb-3 text-center">
                        <img v-lazy="require('../../public/assets/img/thx_widget_referral.png')" class="img-fluid" />
                    </div>
                    <div class="col-lg-5 offset-lg-1">
                        <div class="pt-5 pt-lg-5 pt-xl-4">
                            <h2 class="h5 text-dark">Invite Quests</h2>
                            <p class="lead mb-4 font-size-l">Why marketers ❤️ referral programs</p>
                        </div>
                        <ul class="list-unstyled">
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> Much lower player acquisition costs than
                                other channels
                            </li>
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> Friends referring friends means high %
                                active players
                            </li>
                            <li class="pb-2 lead">
                                <i class="fas fa-check text-success mr-2"></i> Level up your most loyal players to brand
                                champions
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <BaseContact :dark="true" />
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseContact from '@thxnetwork/public/components/BaseContact.vue';
import BaseCardSignup from '@thxnetwork/public/components/BaseCardSignup.vue';
import BaseMetrics from '@thxnetwork/public/components/BaseMetrics.vue';
import BaseRowContent from '../components/BaseRowContent.vue';
import { USE_CASES_BOOST_TAGS, TWITTER_TAGS, LINKS } from '@thxnetwork/public/utils/constants';

export const features = {
    'steam-quest': {
        tag: 'Steam Quest',
        image: require('../../public/assets/img/quest-steam.png'),
        title: 'Unlock Steam Engagement',
        description: 'Embark on a gaming journey by purchasing, wishlisting games, and earning Steam achievements.',
        list: ['Buy a game on Steam', 'Wishlist a game on Steam', 'Earn a Steam achievement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/daily-quests',
    },
    'twitter-quest': {
        tag: 'Twitter Quest',
        image: require('../../public/assets/img/quest-twitter.png'),
        title: 'Boost Your Twitter Presence',
        description: 'Engage your audience on Twitter by creating exciting quests that encourage retweets and likes.',
        list: ['Increase followers', 'Enhance brand recognition', 'Foster community engagement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/social-quests',
    },
    'daily-quest': {
        tag: 'Daily Quest',
        image: require('../../public/assets/img/quest-daily.png'),
        title: 'Boost User Engagement',
        description: 'Provide daily incentives for returning to your website.',
        list: ['Encourage regular visits', 'Enhance user loyalty', 'Foster community growth'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/daily-quests',
    },
    'custom-quest': {
        tag: 'Custom Quest',
        image: require('../../public/assets/img/quest-custom.png'),
        title: 'Seamless Integration',
        description: 'Integrate quests with ease using webhooks to reward important achievements in your application.',
        list: ['Tailor rewards to your app', 'Streamline integration', 'Enhance user experience'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/custom-quests',
    },
    'youtube-quest': {
        tag: 'Youtube Quest',
        image: require('../../public/assets/img/quest-youtube.png'),
        title: 'Expand Your YouTube Presence',
        description:
            'Amplify your presence on YouTube by creating quests that encourage likes, shares, and subscriptions.',
        list: ['Increase video views', 'Boost channel subscribers', 'Enhance YouTube community engagement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/social-quests',
    },
    'invite-quest': {
        tag: 'Invite Quest',
        image: require('../../public/assets/img/quest-invite.png'),
        title: 'Drive User Acquisition',
        description: 'Empower your players to earn rewards for referrals.',
        list: ['Expand your user base', 'Lower acquisition costs', 'Strengthen player networks'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/referral-quests',
    },
    'discord-quest': {
        tag: 'Discord Quest',
        image: require('../../public/assets/img/quest-discord.png'),
        title: 'Strengthen Your Discord Community',
        description:
            'Create quests on Discord to promote community interactions and build a strong, engaged user base.',
        list: ['Grow your Discord server', 'Enhance community participation', 'Boost server activity'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
    },
    'web3-quest': {
        tag: 'Web3 Quest',
        image: require('../../public/assets/img/quest-web3.png'),
        title: 'Empower with Web3 Rewards',
        description: "Reward users' coin balance or NFT ownership using smart contracts.",
        list: ['Leverage blockchain technology', 'Enhance user ownership', 'Facilitate decentralized rewards'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
    },
    'coin-reward': {
        tag: 'Coin Reward',
        image: require('../../public/assets/img/reward-coin.png'),
        title: 'Cashbacks with Coins',
        description: 'Import your own ERC20 smart contract and let users redeem points for coins.',
        list: ['Provide tangible value', 'Boost user retention', 'Incentivize spending'],
        docsUrl: 'https://docs.thx.network/rewards/coins',
    },
    'nft-reward': {
        tag: 'NFT Reward',
        image: require('../../public/assets/img/reward-nft.png'),
        title: 'Exclusive NFTs',
        description: 'Import your own ERC721 or ERC1155 smart contract and let users redeem points for exclusive NFTs.',
        list: ['Offer unique collectibles', 'Enhance user engagement', 'Drive interest in NFTs'],
        docsUrl: 'https://docs.thx.network/rewards/nft',
    },
    'custom-reward': {
        tag: 'Custom Reward',
        image: require('../../public/assets/img/quest-custom.png'),
        title: 'Flexible Rewards',
        description: 'Use inbound webhooks to reward users with custom features in your application.',
        list: ['Tailor rewards to user needs', 'Enhance user satisfaction', 'Drive app adoption'],
        docsUrl: 'https://docs.thx.network/rewards',
    },
    'coupon-reward': {
        tag: 'Coupon Reward',
        image: require('../../public/assets/img/quest-custom.png'),
        title: 'Coupon Codes',
        description:
            'Upload a set of coupon codes as rewards that could be used in webshops or alternative applications.',
        list: ['Expand reach to offline users', 'Enhance user satisfaction', 'Boost ecommerce activity'],
        docsUrl: 'https://docs.thx.network/rewards',
    },
    'discord-role-reward': {
        tag: 'Discord Role Reward',
        image: require('../../public/assets/img/quest-custom.png'),
        title: 'Exclusive Discord Roles',
        description:
            'Use our Discord Bot to reward users with an exclusive Discord role that for example gives access to a hidden channel.',
        list: ['Grow your Discord server', 'Enhance community participation', 'Boost server activity'],
        docsUrl: 'https://docs.thx.network/rewards',
    },
    'qr-codes': {
        tag: 'QR Codes',
        image: '',
        title: 'Offline Reward Distribution',
        description: 'Use QR codes to distribute rewards in offline environments.',
        list: ['Expand reach to offline users', 'Facilitate in-person engagement', 'Enhance brand recognition'],
        docsUrl: 'https://docs.thx.network',
    },
};

export const content = {
    'gala': {
        logo: require('../../public/assets/img/logo-gala-white.png'),
        title: 'Gala',
        lead: "Gala rewards it's community using social quest and coupon rewards.",
        description: 'Complete social quests for $GALA coupon codes and special Discord Roles.',
        features: [
            features['daily-quest'],
            features['youtube-quest'],
            features['twitter-quest'],
            features['coupon-reward'],
            features['discord-role-reward'],
        ],
        video: 'https://www.youtube.com/embed/GWkzpRithHY?rel=0',
        to: '/use-cases/gala',
    },
    'titanborn': {
        logo: require('../../public/assets/img/logo-titanborn.png'),
        title: 'Titanborn',
        lead: 'Titanborn converts their web traffic into campaign participants using a variety of social quests.',
        description: 'Redeem your points for lootbox coupon codes that you can redeem in-game!',
        features: [
            features['discord-quest'],
            features['twitter-quest'],
            features['youtube-quest'],
            features['coupon-reward'],
        ],
        video: 'https://www.youtube.com/embed/PChhRNrLFcc?rel=0',
        to: '/use-cases/titanborn',
    },
    'royal-dutch-mint': {
        logo: require('../../public/assets/img/logo-rdm.png'),
        title: 'Royal Dutch Mint',
        lead: 'The Royal Dutch Mint provides a digital twin NFT using QR codes on their coincard packaging.',
        description: 'Claim your $RDM NFT collectible when you purchase your coincard.',
        features: [features['qr-codes'], features['nft-reward']],
        video: 'https://www.youtube.com/embed/VC3cGMdTF5k?rel=0',
        to: '/use-cases/royal-dutch-mint',
    },
    'forest-knight': {
        logo: require('../../public/assets/img/logo-forest-knight.png'),
        title: 'Forest Knight',
        lead: 'Forest Knight reduces their development costs by using Custom Quests and provides cashbacks for their players.',
        description:
            'Earn $KNIGHT for marketplace purchases and in-game behavior. Join Forest Knight and embark on an epic adventure while earning rewards for your gaming skills.',
        features: [
            features['daily-quest'],
            features['custom-quest'],
            features['coin-reward'],
            features['custom-reward'],
        ],
        video: 'https://www.youtube.com/embed/ZKqkdNKb3ks?rel=0',
        to: '/use-cases/forest-knight',
    },
    'carbify': {
        logo: require('../../public/assets/img/logo-carbify.png'),
        title: 'Carbify',
        lead: 'Carbify implemented THX Network to amplify their social presence using Twitter Quests.',
        description:
            'Earn $CBY, $aCO2 and NFT Landplot for @carbify retweets and likes on Twitter. Help combat climate change while enjoying rewards with Carbify.',
        features: [features['twitter-quest'], features['coin-reward'], features['nft-reward']],
        video: 'https://www.youtube.com/embed/P16POP4Y1qs?rel=0',
        to: '/use-cases/carbify',
    },
    'apebond': {
        logo: require('../../public/assets/img/logo-apebond.png'),
        title: 'ApeBond',
        lead: 'ApeBond leverages Web3 quests to drive bond sales.',
        description: 'Buy bonds and claim points using Web3 Quests to get rewarded in $ABOND and $THX tokens.',
        features: [
            features['web3-quest'],
            features['youtube-quest'],
            features['twitter-quest'],
            features['coin-reward'],
        ],
        video: 'https://www.youtube.com/embed/wu9arfmIAHo?rel=0',
        to: '/use-cases/apebond',
    },
    '2tokens': {
        logo: require('../../public/assets/img/logo-2tokens.webp'),
        title: '2Tokens',
        lead: '2Tokens is taking advantage of THX Network to engage their audience.',
        description:
            "Participate in 2Tokens' Youtube Quests and earn $TWO tokens. Join the 2Tokens community and get rewarded for your support.",
        features: [
            features['twitter-quest'],
            features['youtube-quest'],
            features['invite-quest'],
            features['coin-reward'],
        ],
        video: 'https://www.youtube.com/embed/E9OMkvp78lA?rel=0',
        to: '/use-cases/2tokens',
    },
    'tryhards': {
        logo: require('../../public/assets/img/logo-tryhards.png'),
        title: 'TryHards',
        lead: 'TryHards is embracing THX Network to create exciting experiences for their users.',
        description:
            "Get ready for adventure with TryHards' Invite, Twitter, Discord, and Youtube Quests. Earn $TRY and other rewards for your achievements. With TryHards, you can turn your gaming skills into coins.",
        features: [
            features['invite-quest'],
            features['twitter-quest'],
            features['discord-quest'],
            features['youtube-quest'],
            features['coin-reward'],
        ],
        video: 'https://www.youtube.com/embed/B1qa-xYAA-A?rel=0',
        to: '/use-cases/tryhards',
    },
    'blind-boxes': {
        logo: require('../../public/assets/img/logo-blindboxes.webp'),
        title: 'Blind Boxes',
        lead: 'Blind Boxes relies on THX Network to provide an immersive daily experience.',
        description:
            'Explore the world of BlindBoxes with Invite, Twitter, Discord, and Youtube Quests. Earn coins, rewards, and other exciting treasures as you embark on your daily journey with BlindBoxes.',
        features: [
            features['invite-quest'],
            features['twitter-quest'],
            features['discord-quest'],
            features['youtube-quest'],
            features['coin-reward'],
        ],
        video: 'https://www.youtube.com/embed/msKSs-DrfeY?rel=0',
        to: '/use-cases/blind-boxes',
    },
    'toshimon': {
        logo: require('../../public/assets/img/logo-toshimon.webp'),
        title: 'Toshimon',
        lead: 'Toshimon is harnessing the power of THX Network for an enhanced user experience.',
        description:
            "Join Toshimon's Twitter Quests and earn valuable coins. Become a part of the Toshimon community and get rewarded for your loyalty.",
        features: [features['discord-quest'], features['twitter-quest'], features['coin-reward']],
        video: '',
        to: '/use-cases/blind-boxes',
    },
    'human-divergence': {
        logo: require('../../public/assets/img/logo-tryhards.png'),
        title: 'Human Divergence',
        lead: 'Human Divergence is creating exciting opportunities with THX Network.',
        description:
            'Embark on a journey of discovery with Daily Quests, Twitter Quests, and Youtube Quests by Human Divergence. Earn rewards while exploring the unknown.',
        features: [features['daily-quest'], features['custom-quest'], features['nft-reward']],
        video: '',
        to: '/use-cases/human-divergence',
    },
};

@Component({
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
    components: {
        BaseRowContent,
        BaseMetrics,
        BaseCardSignup,
        BaseContact,
    },
})
export default class ViewUseCaseDetail extends Vue {
    get content() {
        return content[this.$route.params.title];
    }
}
</script>
