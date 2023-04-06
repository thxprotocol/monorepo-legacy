<template>
    <div>
        <p class="text-center">
            <img
                v-if="brand && brand.logoImgUrl"
                :src="brand.logoImgUrl"
                width="100"
                alt="Example logo image"
                class="mb-3"
            />
        </p>
        <b-card
            v-if="$route.query.token"
            :overlay="true"
            :img-src="require('../../public/assets/thx_nft.webp')"
            style="max-width: 620px"
            img-alt="Image"
            img-top
            class="bg-dark text-white shadow-lg"
        >
            <b-badge
                v-if="poolTransfer"
                v-b-tooltip.hover.right
                :title="`Expires at: ${format(new Date(poolTransfer.expiry), 'MMMM do yyyy hh:mm:ss')}`"
                :variant="isExpired ? 'danger' : 'primary'"
                style="font-size: 1rem"
                class="p-2"
            >
                <i v-if="!isExpired" class="fas fa-clock mr-2"></i>
                <span :class="{ 'text-danger': isExpired, 'text-muted': isExpired }">{{ expiryDate }}</span>
            </b-badge>

            <template #footer>
                <b-alert variant="danger" show v-if="error" class="mt-2">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    {{ error }}
                </b-alert>
                <b-card-title>Hi there👋</b-card-title>
                <p>A loyalty widget has been configured for you to reduce your time spent on the integration.</p>
                <b-list-group class="mb-3">
                    <b-list-group-item
                        class="bg-darker d-flex justify-content-between align-items-center text-white"
                        href="https://docs.thx.network/user-guides/rewards"
                        target="_blank"
                    >
                        <div>
                            <i class="fas fa-check-circle text-success mr-1"></i>
                            Configure <strong>point rewards</strong> for users to earn
                        </div>
                        <b-badge variant="dark" pill>5 minutes</b-badge>
                    </b-list-group-item>
                    <b-list-group-item
                        class="bg-darker d-flex justify-content-between align-items-center text-white"
                        href="https://docs.thx.network/user-guides/perks"
                        target="_blank"
                    >
                        <div>
                            <i class="fas fa-check-circle text-success mr-1"></i>
                            Configure <strong>crypto perks</strong> for users to redeem
                        </div>
                        <b-badge variant="dark" pill>10 minutes</b-badge>
                    </b-list-group-item>
                    <b-list-group-item
                        href="#"
                        class="bg-darker d-flex justify-content-between align-items-center text-white"
                        v-clipboard:copy="code"
                        v-clipboard:success="() => (isCopied = true)"
                        size="sm"
                    >
                        <div>
                            <i class="fas fa-check-circle text-success mr-1"></i> Embed the
                            <strong>widget script</strong> in HTML pages
                        </div>
                        <b-badge variant="dark" pill>10 minutes</b-badge>
                    </b-list-group-item>
                </b-list-group>
                <p class="small text-muted">Ask your dev to add this to the &lt;head&gt; of your website 👇</p>
                <pre
                    class="rounded text-white p-3 d-flex align-items-center bg-darker overflow-hidden"
                    style="white-space: nowrap"
                >
                    <b-button 
                        variant="light" 
                        v-clipboard:copy="code"
                        v-clipboard:success="() => isCopied = true" size="sm" class="mr-3">
                        <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                    </b-button>
                    <code class="language-html" v-html="codeExample"></code>
                </pre>
                <b-button
                    variant="success"
                    class="rounded-pill"
                    block
                    @click="onClickTransfer"
                    :disabled="!poolTransfer"
                >
                    <span v-if="isTransferLoading"><b-spinner small variant="white" /> Transfering... </span>
                    <strong v-else>Start now!</strong>
                </b-button>
                <p class="text-center mt-2 small text-muted" v-if="poolTransfer">
                    For security reasons this URL expires at
                    <strong>{{ format(new Date(poolTransfer.expiry), 'MMMM do yyyy hh:mm:ss') }}</strong>
                </p>
            </template>
        </b-card>
    </div>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { initWidget } from '../utils/widget';
import { TBrand } from '../store/modules/brands';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import { format, formatDistance } from 'date-fns';
import axios, { AxiosError } from 'axios';
import { TPoolTransferResponse } from '@thxnetwork/types/interfaces';
import { UserManager } from 'oidc-client-ts';
import { config } from '../utils/oidc';
import { DASHBOARD_URL } from '@thxnetwork/wallet/utils/secrets';

hljs.registerLanguage('xml', XML);

@Component({
    computed: mapGetters({
        brands: 'brands/all',
    }),
})
export default class WidgetPreviewView extends Vue {
    format = format;
    isTransferLoading = false;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';
    poolTransfer: TPoolTransferResponse | null = null;
    defaultLogoImgUrl = require('@thxnetwork/dashboard/../public/assets/logo.png');
    defaultBackgroundImgUrl = require('../../public/assets/thx_jumbotron.webp');
    isCopied = false;
    error = '';

    get code() {
        return `<script src="${API_URL}/v1/widget/${this.$route.params.poolId}.js"><\/script>`;
    }

    get codeExample() {
        return hljs.highlight(`<script src="${API_URL}/v1/widget/${this.$route.params.poolId}.js"><\/script>`, {
            language: 'xml',
        }).value;
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

    get brand() {
        let brand = this.brands[this.$route.params.poolId];
        if (!brand) {
            brand = { logoImgUrl: this.defaultLogoImgUrl, backgroundImgUrl: this.defaultBackgroundImgUrl };
        }
        return brand;
    }

    async mounted() {
        const poolId = this.$route.params.poolId;
        initWidget(poolId);

        await this.$store.dispatch('brands/getForPool', poolId);

        this.setBackground(this.brand);

        if (this.$route.query.token) {
            this.poolTransfer = await this.getPoolTransfer();
        }
    }

    async getPoolTransfer() {
        try {
            const r = await axios({
                method: 'GET',
                url: `${API_URL}/v1/pools/${this.$route.params.poolId}/transfers/${this.$route.query.token}`,
                withCredentials: false,
            });

            return r.data;
        } catch (error) {
            this.setError(error as AxiosError);
        }
    }

    setBackground(brand: TBrand) {
        const app = document.getElementById('app');
        if (!app) return;
        app.style.opacity = '1';
        app.style.backgroundImage = brand.backgroundImgUrl ? `url('${brand.backgroundImgUrl}')` : '';
    }

    async onClickTransfer() {
        if (!this.poolTransfer) return;
        this.isTransferLoading = true;

        const userManager = new UserManager(config);
        const user = await userManager.getUser();

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

            window.location.href = `${DASHBOARD_URL}/pool/${this.poolTransfer.poolId}`;
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
</style>
