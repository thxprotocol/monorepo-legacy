<template>
    <div>
        <p class="text-center">
            <img v-if="logoImgUrl" :src="logoImgUrl" width="100" alt="Example logo image" class="mb-3" />
        </p>

        <b-card style="max-width: 620px" class="bg-dark text-white shadow-lg mb-10 mb-md-0">
            <iframe
                width="100%"
                height="315"
                src="https://www.youtube-nocookie.com/embed/6XvN2SfswvI?controls=0"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
            ></iframe>
            <template #footer>
                <b-alert show variant="info" class="mb-4">
                    <i class="fas fa-exclamation-circle mr-2"> </i>
                    <strong>This page is used only for demo purposes.</strong>
                    <p class="m-0">Watch the video to see how the campaign widget runs in your website.</p>
                </b-alert>
                <b-card-title>Hi👋</b-card-title>
                <p class="font-weight-bold">We have prepared a Quest &amp; Reward campaign for {{ title }}!❤️</p>
                <p>
                    Read more about its features below, play with the suggested Quests &amp; Rewards, and please reach
                    out if you have any questions!
                </p>
                <b-row>
                    <b-button variant="link" block v-b-toggle.collapse1 class="py-3 d-block text-gray text-left">
                        Learn about <strong>infrastructure</strong>
                        <i class="fas fa-question-circle ml-2"></i>
                    </b-button>
                    <b-collapse id="collapse1" class="w-100">
                        <b-list-group class="mb-3">
                            <b-list-group-item
                                :key="key"
                                v-for="(item, key) of [
                                    {
                                        icon: 'fas fa-wallet',
                                        color: '#666',
                                        label: 'Smart Wallets',
                                        description: 'Polygon smart contract wallets ideal for non-crypto natives.',
                                    },
                                    {
                                        icon: 'fas fa-save',
                                        color: '#666',
                                        label: 'Virtual Wallets',
                                        description: 'Qualify users for custom quests even before account sign up.',
                                    },
                                    {
                                        icon: 'fas fa-tags',
                                        color: '#666',
                                        label: 'Free Transactions',
                                        description: 'Let us worry about transactions costs and delivery.',
                                    },
                                    {
                                        icon: 'fas fa-chart-line',
                                        color: '#666',
                                        label: 'Analytics &amp; Monitoring',
                                        description: 'Keep an eye on the performance of your quests.',
                                    },
                                ]"
                                class="bg-darker"
                            >
                                <div class="d-flex justify-content-start align-items-center">
                                    <div style="width: 30px">
                                        <i :class="item.icon" :style="{ color: item.color }" class="mr-1"></i>
                                    </div>
                                    {{ item.label }}
                                </div>
                                <p class="text-muted">
                                    {{ item.description }}
                                </p>
                                <!-- <b-link v-b-tooltip :title="item.description" class="ml-auto">
                                    <i class="fas fa-question-circle text-dark mr-1"></i>
                                </b-link> -->
                            </b-list-group-item>
                        </b-list-group>
                    </b-collapse>
                    <b-button variant="link" block v-b-toggle.collapse2 class="py-3 d-block text-gray text-left">
                        Learn about <strong>quests</strong> <i class="fas fa-question-circle ml-2"></i>
                    </b-button>
                    <b-collapse id="collapse2" class="w-100">
                        <b-list-group-item
                            :key="key"
                            v-for="(item, key) of [
                                {
                                    icon: 'fas fa-calendar',
                                    color: '#666',
                                    label: 'Daily Quests',
                                    description: 'Provide daily incentives for player behavior',
                                },
                                {
                                    icon: 'fas fa-comments',
                                    color: '#666',
                                    label: 'Referral Quests',
                                    description: 'Empower your players to invite their friends and earn points',
                                },
                                {
                                    icon: 'fas fa-trophy',
                                    color: '#666',
                                    label: 'Social Quests',
                                    description:
                                        'Stimulate social enagement with Twitter, Discord, YouTube, Github and Twitch validations',
                                },
                                {
                                    icon: 'fas fa-flag',
                                    color: '#666',
                                    label: 'Custom Quests',
                                    description:
                                        'Use outbound webhooks to reward important achievements in your application',
                                },
                            ]"
                            class="bg-darker text-white"
                        >
                            <div class="d-flex justify-content-start align-items-center">
                                <div style="width: 30px">
                                    <i :class="item.icon" :style="{ color: item.color }" class="mr-1"></i>
                                </div>
                                {{ item.label }}
                            </div>
                            <p class="text-muted">
                                {{ item.description }}
                            </p>
                            <!-- <b-link v-b-tooltip :title="item.description" class="ml-auto">
                                    <i class="fas fa-question-circle text-dark mr-1"></i>
                                </b-link> -->
                        </b-list-group-item>
                    </b-collapse>
                    <b-button variant="link" block v-b-toggle.collapse3 class="py-3 d-block text-gray text-left">
                        Learn about <strong>rewards</strong> <i class="fas fa-question-circle ml-2"></i>
                    </b-button>
                    <b-collapse id="collapse3" class="w-100">
                        <b-list-group-item
                            :key="key"
                            v-for="(item, key) of [
                                {
                                    icon: 'fas fa-coins',
                                    color: '#666',
                                    label: 'Coin Rewards',
                                    description: 'Create rewards for ERC20 contracts',
                                },

                                {
                                    icon: 'fas fa-palette',
                                    color: '#666',
                                    label: 'NFT Rewards',
                                    description: 'Create rewards for ERC721 or ERC1155 contracts',
                                },

                                {
                                    icon: 'fas fa-gift',
                                    color: '#666',
                                    label: 'Custom Rewards',
                                    description: 'Use inbound webhooks to reward with custom code running in your game',
                                },

                                {
                                    icon: 'fas fa-qrcode',
                                    color: '#666',
                                    label: 'QR Codes',
                                    description: 'Use QR codes to give rewards in an offline environment',
                                },
                            ]"
                            class="bg-darker"
                        >
                            <div class="d-flex justify-content-start align-items-center">
                                <div style="width: 30px">
                                    <i :class="item.icon" :style="{ color: item.color }" class="mr-1"></i>
                                </div>
                                {{ item.label }}
                            </div>
                            <p class="text-muted">
                                {{ item.description }}
                            </p>
                            <!-- <b-link v-b-tooltip :title="item.description" class="ml-auto">
                                    <i class="fas fa-question-circle text-dark mr-1"></i>
                                </b-link> -->
                        </b-list-group-item>
                    </b-collapse>
                    <b-button variant="link" block v-b-toggle.collapse4 class="py-3 d-block text-gray text-left">
                        Learn about <strong>integrations</strong> <i class="fas fa-question-circle ml-2"></i>
                    </b-button>
                    <b-collapse id="collapse4" class="w-100">
                        <b-list-group-item
                            :key="key"
                            v-for="(item, key) of [
                                {
                                    icon: 'fab fa-discord',
                                    color: '#7289da',
                                    label: 'Discord',
                                    description: 'Create quests for Discord server activity	',
                                },
                                {
                                    icon: 'fab fa-twitter',
                                    color: '#1DA1F2',
                                    label: 'Twitter',
                                    description: 'Automate social quest creation with hashtag filters',
                                },
                                {
                                    icon: 'fab fa-youtube',
                                    color: '#FF0000',
                                    label: 'Youtube',
                                    description: 'Create quests for Youtube channel activity',
                                },
                                {
                                    icon: 'fas fa-shopping-cart',
                                    color: '#F2F2F2 !important',
                                    label: 'Payment Methods',
                                    description: 'Sell rewards with crypto, credit Card & local payment providers	',
                                },
                            ]"
                            class="bg-darker"
                        >
                            <div class="d-flex justify-content-start align-items-center">
                                <div style="width: 30px">
                                    <i :class="item.icon" :style="{ color: item.color }" class="mr-1"></i>
                                </div>
                                {{ item.label }}
                            </div>
                            <p class="text-muted">
                                {{ item.description }}
                            </p>
                            <!-- <b-link v-b-tooltip :title="item.description" class="ml-auto">
                                    <i class="fas fa-question-circle text-dark mr-1"></i>
                                </b-link> -->
                        </b-list-group-item>
                    </b-collapse>
                </b-row>
            </template>
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { initWidget } from '../utils/widget';
import { TBrand } from '../store/modules/brands';
import { API_URL, PUBLIC_URL } from '@thxnetwork/dashboard/utils/secrets';
import { format, formatDistance } from 'date-fns';
import axios, { AxiosError } from 'axios';
import { TPoolTransferResponse } from '@thxnetwork/types/interfaces';
import { UserManager } from 'oidc-client-ts';
import { config } from '../utils/oidc';
import { BASE_URL } from '../utils/secrets';
import { track } from '@thxnetwork/mixpanel';
import BaseCodeExample from '../components/BaseCodeExample.vue';

@Component({
    metaInfo() {
        const { $route } = this as WidgetPreviewView;
        const { poolId } = $route.params;
        const previewImage = `${API_URL}/pools/preview/default/${poolId}.png`;
        const title = this.title + ' | THX Network';
        const description = 'Web preview of your Quest & Reward campaign.';

        return {
            title,
            meta: [
                { name: 'title', content: title },
                { vmid: 'description', name: 'description', content: description },
                { name: 'keywords', content: '' },
                { name: 'twitter:card', content: this.logoImgUrl },
                { name: 'twitter:site', content: PUBLIC_URL },
                { name: 'twitter:creator', content: '@thxprotocol' },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: '' },
                { name: 'twitter:image', content: previewImage },
                { name: 'twitter:image:alt', content: title },
                { name: 'og:title', content: title },
                { name: 'og:description', content: description },
                { name: 'og:type', content: 'website' },
                { name: 'og:site_name', content: title },
                { name: 'og:url', content: this.$route.fullPath },
                { name: 'og:image', content: previewImage },
            ],
            link: [{ rel: 'canonical', href: this.$route.fullPath }],
        };
    },
    components: {
        BaseCodeExample,
    },
    computed: mapGetters({
        brands: 'brands/all',
    }),
} as any)
export default class WidgetPreviewView extends Vue {
    format = format;
    isTransferLoading = false;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';
    poolTransfer: TPoolTransferResponse | null = null;
    defaultLogoImgUrl = require('../../public/assets/logo.png');
    defaultBackgroundImgUrl = require('../../public/assets/thx_jumbotron.webp');
    error = '';
    userManager = new UserManager(config);

    get isExpired() {
        if (!this.poolTransfer) return;
        return this.poolTransfer.expiry && this.poolTransfer.now - new Date(this.poolTransfer.expiry).getTime() > 0;
    }

    get expiryDate() {
        if (!this.poolTransfer) return;
        return !this.isExpired && this.poolTransfer.expiry
            ? formatDistance(new Date(this.poolTransfer.expiry), new Date(this.poolTransfer.now), {
                  addSuffix: false,
              })
            : 'expired';
    }

    title = '';

    async mounted() {
        // Ping mixpanel that the page is visited
        this.userManager.getUser().then((user) => {
            track('UserVisits', [user?.profile.sub, 'preview', { poolId: this.$route.params.poolId }]);
        });

        // Inject the widget
        initWidget(this.$route.params.poolId);

        const { data } = await axios.get(API_URL + '/v1/widget/' + this.$route.params.poolId);
        this.title = data.title;
        this.logoImgUrl = data.logoUrl || this.defaultLogoImgUrl;

        this.setBackground();
    }

    setBackground() {
        const app = document.getElementById('app');
        if (!app) return;
        app.style.opacity = '1';
        document.body.style.height = 'auto';
        document.body.style.backgroundColor = '#212529';
        // document.body.style.backgroundSize = 'cover';
        // document.body.style.backgroundAttachment = 'fixed';
        // document.body.style.backgroundPosition = 'center center';
        // document.body.style.backgroundImage = src ? `url('${src}')` : '';
    }

    async onClickTransfer() {
        if (!this.poolTransfer) return;
        this.isTransferLoading = true;

        const user = await this.userManager.getUser();
        if (!user || user.expired) {
            await this.$store.dispatch('account/signinRedirect', {
                poolId: this.poolTransfer.poolId,
                poolTransferToken: this.poolTransfer.token,
            });
            this.isTransferLoading = false;
            return;
        }

        try {
            await axios({
                method: 'POST',
                url: `/pools/${this.$route.params.poolId}/transfers`,
                data: {
                    sub: user.profile.sub,
                    token: this.$route.query.token,
                },
            });

            window.location.href = `${BASE_URL}/pool/${this.poolTransfer.poolId}`;
        } catch (error) {
            this.setError(error as AxiosError);
        } finally {
            this.isTransferLoading = false;
        }
    }

    setError(error: AxiosError) {
        this.error = error.response?.data.error.message || 'Something went wrong...';
    }
}
</script>
<style>
#app {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    height: 100% !important;
}
</style>
<style scoped lang="scss">
.sidebar-sibling {
    display: block;
}
.btn-success {
    transition: all 0.1s ease;
    background-color: darken(#98d80d, 10%);
    border-color: darken(#98d80d, 10%);
    outline: none !important;
}

.btn-success:not(:disabled):not(.disabled):active:focus,
.btn-success:not(:disabled):not(.disabled).active:focus,
.show > .btn-success.dropdown-toggle:focus {
    background-color: darken(#98d80d, 15%);
    border-color: darken(#98d80d, 15%);
    box-shadow: rgba(113, 63, 205, 0.5) 0 0px 15px;
}
.btn-success:hover,
.btn-success:active {
    box-shadow: rgba(113, 63, 205, 0.5) 0 0px 15px;
    background-color: darken(#98d80d, 5%);
    text-shadow: 1px 1px rgba(89, 66, 193, 0.5);
}
.card-img-overlay {
    display: flex;
    align-items: center;
}
.mb-10 {
    margin-bottom: 12rem;
}
</style>
