<template>
    <div>
        <h2 class="mb-3">Settings</h2>
        <b-card class="shadow-sm mb-5">
            <template v-if="profile && profile.plan === 1">
                <b-form-row>
                    <b-col md="4">
                        <strong>Commerce</strong>
                        <p class="text-muted">Enable FIAT payment methods to enable your users to buy your perks.</p>
                    </b-col>
                    <b-col md="8">
                        <b-form-row v-if="!profile.merchant">
                            <b-col md="12">
                                <b-alert show variant="success" class="d-flex align-items-center">
                                    <i class="fas fa-tags mr-2"></i>
                                    Become a merchant and unlock the ability to sell your perks!
                                    <b-button
                                        class="rounded-pill ml-auto"
                                        variant="primary"
                                        @click="onClickMerchantCreate"
                                        :disabled="isLoadingMerchantCreate"
                                    >
                                        <b-spinner v-if="isLoadingMerchantCreate" small variant="light" class="mr-2" />
                                        Become a Merchant
                                    </b-button>
                                </b-alert>
                            </b-col>
                        </b-form-row>
                        <b-form-row v-else>
                            <b-col md="8">
                                <b-form-group label="Merchant ID">
                                    <b-form-input
                                        readonly
                                        disabled
                                        :value="profile.merchant ? profile.merchant.stripeConnectId : ''"
                                    />
                                </b-form-group>
                                <b-alert
                                    show
                                    variant="warning"
                                    class="center-center"
                                    v-if="
                                        merchantStatus.filter((s) => !s.status).length &&
                                        merchantStatus.filter((s) => !s.status).length < 3
                                    "
                                >
                                    <i class="fas fa-exclamation-triangle mr-2"></i>
                                    You have not finished the configuration of your Merchant account.
                                </b-alert>
                            </b-col>
                            <b-col md="4">
                                <b-form-group label="Connection">
                                    <b-list-group class="mb-3">
                                        <b-list-group-item v-for="(s, key) in merchantStatus" :key="key">
                                            <b-link v-if="!s.status" @click="onClickMerchantLink">
                                                <i
                                                    class="fas fa-check-circle mr-2"
                                                    :class="s.status ? 'text-success' : 'text-muted'"
                                                >
                                                </i>
                                                {{ s.label }}
                                            </b-link>
                                            <template v-else>
                                                <i
                                                    class="fas fa-check-circle mr-2"
                                                    :class="s.status ? 'text-success' : 'text-muted'"
                                                >
                                                </i>
                                                {{ s.label }}
                                            </template>
                                        </b-list-group-item>
                                    </b-list-group>
                                    <b-button
                                        block
                                        variant="light"
                                        @click="onClickDisconnectMerchant"
                                        class="text-danger"
                                    >
                                        <b-spinner
                                            v-if="isLoadingMerchantDisconnect"
                                            small
                                            variant="light"
                                            class="mr-2"
                                        />
                                        Disconnect
                                    </b-button>
                                </b-form-group>
                            </b-col>
                        </b-form-row>
                    </b-col>
                </b-form-row>
                <hr />
            </template>
            <b-form-row>
                <b-col md="4">
                    <strong>Discord</strong>
                    <p class="text-muted">Install THX Bot to increase engagement in your Discord server.</p>
                </b-col>
                <b-col md="8">
                    <b-alert show variant="info" class="d-flex align-items-center">
                        <i class="fab fa-discord mr-2"></i>
                        Install THX Bot to increase engagement in your Discord server.
                        <b-button class="rounded-pill ml-auto" variant="primary" :href="urlDiscordBotInstall">
                            Install THX Bot
                        </b-button>
                    </b-alert>
                    <b-form-group
                        label="Announcements"
                        description="Provide a webhook URL connect to the channel where you want to publish notifications about newly created rewards."
                    >
                        <b-form-input placeholder="https://eawgw"></b-form-input>
                    </b-form-group>
                </b-col>
            </b-form-row>
            <hr />
            <b-form-row>
                <b-col md="4">
                    <strong>Widget Theming</strong>
                    <p class="text-muted">Configure background and logo used on the user authentication pages.</p>
                </b-col>
                <b-col md="8">
                    <b-form-row>
                        <b-col md="8">
                            <b-form-group label="Logo URL">
                                <b-form-file class="mb-3" @change="onUpload($event, 'logoImgUrl')" accept="image/*" />
                            </b-form-group>
                        </b-col>
                        <b-col md="4">
                            <b-card body-class="py-5 text-center" class="mb-3" bg-variant="light">
                                <template v-if="logoImgUrl">
                                    <img
                                        width="100%"
                                        height="auto"
                                        class="m-0"
                                        alt="Signin page logo image"
                                        :src="logoImgUrl"
                                    /><br />
                                    <b-link @click="onClickRemoveLogo" class="text-danger">Remove</b-link>
                                </template>
                                <span v-else class="text-gray">Preview logo URL</span>
                            </b-card>
                        </b-col>
                    </b-form-row>
                    <b-form-row>
                        <b-col md="8">
                            <b-form-group label="Background URL">
                                <b-form-file @change="onUpload($event, 'backgroundImgUrl')" accept="image/*" />
                            </b-form-group>
                        </b-col>
                        <b-col md="4">
                            <b-card body-class="py-5 text-center" class="mb-3" bg-variant="light">
                                <template v-if="backgroundImgUrl">
                                    <img
                                        width="100%"
                                        height="auto"
                                        class="m-0"
                                        alt="Signin page background image"
                                        :src="backgroundImgUrl"
                                    /><br />
                                    <b-link @click="onClickRemoveBackground" class="text-danger">Remove</b-link>
                                </template>
                                <span v-else class="text-gray">Preview background URL</span>
                            </b-card>
                        </b-col>
                    </b-form-row>
                </b-col>
            </b-form-row>
        </b-card>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { TBrand } from '@thxnetwork/dashboard/store/modules/brands';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { TMerchant } from '@thxnetwork/types/merchant';
import { DISCORD_CLIENT_ID } from '@thxnetwork/dashboard/utils/secrets';

@Component({
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
            merchant: 'merchants/merchant',
        }),
    },
})
export default class SettingsView extends Vue {
    ChainId = ChainId;
    loading = true;
    chainInfo = chainInfo;
    profile!: IAccount;
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    merchant!: TMerchant;

    logoImgUrl = '';
    backgroundImgUrl = '';
    isLoadingMerchantCreate = false;
    isLoadingMerchantCreateLink = false;
    isLoadingMerchantDisconnect = false;

    get urlDiscordBotInstall() {
        return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=133120&scope=bot`;
    }

    get merchantStatus() {
        if (!this.merchant) return [];
        return [
            {
                status: this.merchant.detailsSubmitted,
                label: 'Provide company details',
            },
            {
                status: this.merchant.chargesEnabled,
                label: 'Enable user payments',
            },
            {
                status: this.merchant.payoutsEnabled,
                label: 'Enable company payouts',
            },
        ];
    }
    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isBrandUpdateInvalid() {
        const backgroundUrlIsValid = this.backgroundImgUrl
            ? isValidUrl(this.backgroundImgUrl)
            : this.backgroundImgUrl === '';
        const logoUrlIsValid = this.logoImgUrl ? isValidUrl(this.logoImgUrl) : this.logoImgUrl === '';
        return logoUrlIsValid && backgroundUrlIsValid;
    }

    get brand() {
        return this.brands[this.$route.params.id];
    }

    async mounted() {
        this.chainId = this.pool.chainId;

        await this.$store.dispatch('brands/getForPool', this.pool._id);
        if (this.brand) {
            this.backgroundImgUrl = this.brand.backgroundImgUrl;
            this.logoImgUrl = this.brand.logoImgUrl;
        }
        await this.$store.dispatch('merchants/read');

        this.loading = false;
    }

    async upload(file: File) {
        return await this.$store.dispatch('images/upload', file);
    }

    async onUpload(event: any, key: string) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this, key, publicUrl);
        await this.update();
    }

    async onClickRemoveBackground() {
        this.backgroundImgUrl = '';
        await this.update();
    }

    async onClickRemoveLogo() {
        this.logoImgUrl = '';
        await this.update();
    }

    async update() {
        this.loading = true;
        await this.$store.dispatch('brands/update', {
            pool: this.pool,
            brand: {
                backgroundImgUrl: this.backgroundImgUrl,
                logoImgUrl: this.logoImgUrl,
            },
        });
        this.loading = false;
    }
    async onClickMerchantLink() {
        this.isLoadingMerchantCreateLink = true;
        await this.$store.dispatch('merchants/createLink', this.pool);
        this.isLoadingMerchantCreateLink = false;
    }
    async onClickMerchantCreate() {
        this.isLoadingMerchantCreate = true;
        await this.$store.dispatch('merchants/create');
        await this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('merchants/read');
        this.isLoadingMerchantCreate = false;
    }
    async onClickDisconnectMerchant() {
        this.isLoadingMerchantDisconnect = true;
        await this.$store.dispatch('merchants/delete');
        await this.$store.dispatch('account/getProfile');
        this.isLoadingMerchantDisconnect = false;
    }
}
</script>
