<template>
    <div>
        <h2 class="mb-3">Settings</h2>
        <b-card class="shadow-sm mb-5">
            <b-form-row v-if="profile">
                <b-col md="4">
                    <strong>Commerce</strong>
                    <p class="text-muted">Enable FIAT payment methods to enable your users to buy your perks.</p>
                </b-col>
                <b-col mb="8">
                    <b-alert v-if="!profile.merchant" show variant="success" class="d-flex align-items-center">
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
                    <b-form-group label="Stripe Connect ID">
                        <b-form-input readonly disabled :value="profile.merchant.stripeConnectId" />
                    </b-form-group>
                </b-col>
            </b-form-row>
            <hr />
            <b-form-row>
                <b-col md="4">
                    <strong>Widget Theming</strong>
                    <p class="text-muted">Configure background and logo used on the user authentication pages.</p>
                </b-col>
                <b-col mb="8">
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

@Component({
    computed: mapGetters({
        brands: 'brands/all',
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class SettingsView extends Vue {
    ChainId = ChainId;
    loading = true;
    chainInfo = chainInfo;
    profile!: IAccount;
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';
    isLoadingMerchantCreate = false;

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

    mounted() {
        this.chainId = this.pool.chainId;
        this.get().then(() => {
            this.loading = false;
        });
    }

    async upload(file: File) {
        return await this.$store.dispatch('images/upload', file);
    }

    async get() {
        await this.$store.dispatch('brands/getForPool', this.pool);
        if (this.brand) {
            this.backgroundImgUrl = this.brand.backgroundImgUrl;
            this.logoImgUrl = this.brand.logoImgUrl;
        }
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
    async onClickMerchantCreate() {
        this.isLoadingMerchantCreate = true;
        await this.$store.dispatch('merchants/create');
        this.isLoadingMerchantCreate = false;
    }
}
</script>
