<template>
    <b-container>
        <p class="text-center">
            <img v-if="logoImgUrl" :src="logoImgUrl" width="100" alt="Example logo image" class="mb-3" />
        </p>
        <b-row>
            <b-col md="6" class="order-0">
                <b-alert show variant="info" class="mb-3">
                    <i class="fas fa-info-circle mr-2"> </i>
                    This is your campaign widget preview!
                </b-alert>
                <b-card class="bg-dark text-white shadow-lg mb-10 mb-md-0 d-none d-md-flex">
                    <b-card-title>Hi👋</b-card-title>
                    <p>Read about the widget features below and feel free to reach out if you have any questions.</p>
                    <b-link :to="`/campaign/${$route.params.poolId}/developer/general`">
                        <i class="fas fa-caret-right mr-1" />
                        Add to your HTML page
                    </b-link>
                    <br />
                    <b-link :to="`/campaign/${$route.params.poolId}/settings/appearance`">
                        <i class="fas fa-caret-right mr-1" />
                        Change color theme
                    </b-link>
                    <br />
                    <b-link :to="`/campaign/${$route.params.poolId}/settings/widget`">
                        <i class="fas fa-caret-right mr-1" />
                        Change widget settings
                    </b-link>
                    <br />
                    <b-link :href="campaignUrl">
                        <i class="fas fa-caret-right mr-1" />
                        Visit your Campaign URL
                    </b-link>
                </b-card>

                <b-card class="mt-3 bg-dark text-white shadow-lg mb-10 mb-md-0 d-none d-md-flex" body-class="p-0">
                    <b-button variant="link" block v-b-toggle.collapse2 class="py-3 d-block text-gray text-left pl-2">
                        <i class="fas fa-question-circle mr-1"></i>
                        Learn about <strong>Quests</strong>
                    </b-button>
                    <b-collapse id="collapse2" class="w-100">
                        <b-list-group-item :key="key" v-for="(item, key) of contentQuests" class="bg-darker text-white">
                            <div class="d-flex justify-content-start align-items-center">
                                <div style="width: 30px">
                                    <i :class="item.icon" :style="{ color: item.color }" class="mr-1"></i>
                                </div>
                                {{ item.tag }}
                            </div>
                            <p class="text-muted">
                                {{ item.description }}
                            </p>
                            <!-- <b-link v-b-tooltip :title="item.description" class="ml-auto">
                                <i class="fas fa-question-circle text-dark mr-1"></i>
                            </b-link> -->
                        </b-list-group-item>
                    </b-collapse>
                    <b-button variant="link" block v-b-toggle.collapse3 class="py-3 d-block text-gray text-left pl-2">
                        <i class="fas fa-question-circle mr-1"></i>
                        Learn about <strong>Rewards</strong>
                    </b-button>
                    <b-collapse id="collapse3" class="w-100">
                        <b-list-group-item :key="key" v-for="(item, key) of contentRewards" class="bg-darker">
                            <div class="d-flex justify-content-start align-items-center">
                                <div style="width: 30px">
                                    <i :class="item.icon" :style="{ color: item.color }" class="mr-1"></i>
                                </div>
                                {{ item.tag }}
                            </div>
                            <p class="text-muted">
                                {{ item.description }}
                            </p>
                            <!-- <b-link v-b-tooltip :title="item.description" class="ml-auto">
                                    <i class="fas fa-question-circle text-dark mr-1"></i>
                                </b-link> -->
                        </b-list-group-item>
                    </b-collapse>
                    <b-button variant="link" block v-b-toggle.collapse1 class="py-3 d-block text-gray text-left pl-2">
                        <i class="fas fa-question-circle mr-1"></i>
                        Learn about <strong>Wallets</strong>
                    </b-button>
                    <b-collapse id="collapse1" class="w-100">
                        <b-list-group class="mb-3">
                            <b-list-group-item
                                :key="key"
                                v-for="(item, key) of [
                                    {
                                        icon: 'fas fa-chart-line',
                                        color: '#666',
                                        label: 'Analytics &amp; Monitoring',
                                        description:
                                            'Keep an eye on campaign participants and the performance of your quests.',
                                    },
                                    {
                                        icon: 'fas fa-save',
                                        color: '#666',
                                        label: 'Identity &amp; Events',
                                        description:
                                            'Onboard your own users in your campaign and use in-game events to build quests.',
                                    },
                                    {
                                        icon: 'fas fa-tags',
                                        color: '#666',
                                        label: 'Free Transactions',
                                        description: 'Let us worry about transactions costs and delivery.',
                                    },
                                    {
                                        icon: 'fas fa-wallet',
                                        color: '#666',
                                        label: 'Smart Wallets',
                                        description:
                                            'Self-custodial Safe multisig wallets ideal for non-crypto natives.',
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
                    <b-button variant="link" block v-b-toggle.collapse4 class="py-3 d-block text-gray text-left pl-2">
                        <i class="fas fa-question-circle mr-1"></i>
                        Learn about <strong>Integrations</strong>
                    </b-button>
                    <b-collapse id="collapse4" class="w-100">
                        <b-list-group-item
                            :key="key"
                            v-for="(item, key) of [
                                {
                                    icon: 'fab fa-discord',
                                    color: '#7289da',
                                    label: 'Discord',
                                    description: 'Show campaign activity in discord and onboard Discord members.',
                                },
                                {
                                    icon: 'fab fa-twitter',
                                    color: '#1DA1F2',
                                    label: 'Twitter',
                                    description: 'Automate social quest creation with hashtag filters',
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
                        </b-list-group-item>
                    </b-collapse>
                </b-card>
            </b-col>
            <b-col md="6">
                <div id="thx-widget-preview" class="h-100" style="min-height: 750px; max-height: 750px"></div>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { initWidget } from '@thxnetwork/dashboard/utils/widget';
import { TBrand } from '@thxnetwork/dashboard/store/modules/brands';
import { API_URL, PUBLIC_URL, WIDGET_URL } from '@thxnetwork/dashboard/config/secrets';
import { format, formatDistance } from 'date-fns';
import { contentQuests, contentRewards } from '@thxnetwork/common/constants';
import axios from 'axios';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';

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
    defaultLogoImgUrl = require('@thxnetwork/dashboard/../public/assets/logo.png');
    defaultBackgroundImgUrl = require('@thxnetwork/dashboard/../public/assets/thx_jumbotron.webp');
    error = '';
    contentQuests = contentQuests;
    contentRewards = contentRewards;
    title = '';
    slug = '';

    get campaignUrl() {
        return `${WIDGET_URL}/c/${this.slug}`;
    }

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
    async mounted() {
        // Inject the widget
        initWidget(this.$route.params.poolId, '#thx-widget-preview');

        const { data } = await axios.get(API_URL + '/v1/widget/' + this.$route.params.poolId);
        this.title = data.title;
        this.slug = data.slug;
        this.logoImgUrl = data.logoUrl || this.defaultLogoImgUrl;

        this.setBackground();
    }

    setBackground() {
        const app = document.getElementById('app');
        if (!app) return;
        app.style.opacity = '1';
        document.body.style.height = 'auto';
        document.body.style.backgroundColor = '#212529';
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
