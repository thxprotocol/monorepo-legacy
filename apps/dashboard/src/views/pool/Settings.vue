<template>
    <div>
        <h2 class="">Settings</h2>
        <p class="text-muted">
            Personalize the unauthenticated sign-in and claim pages for your users by providing a default background
            image and your logo.
        </p>
        <b-card class="shadow-sm mb-5">
            <b-form-row>
                <b-col md="6">
                    <b-form-group
                        label="Logo URL"
                        description="This logo image is shown above the login panel users see when claiming your crypto or NFT's."
                    >
                        <b-form-file @change="onUpload($event, 'logoImgUrl')" accept="image/*" />
                    </b-form-group>
                </b-col>
                <b-col>
                    <label>Preview</label>
                    <b-card body-class="py-5 text-center" class="mb-3" bg-variant="light">
                        <img
                            height="65"
                            width="65"
                            class="m-0"
                            alt="Signin page logo image"
                            :src="logoImgUrl"
                            v-if="logoImgUrl"
                        />
                        <span v-else class="text-gray">Preview logo URL</span>
                    </b-card>
                </b-col>
            </b-form-row>
            <hr />
            <b-form-row>
                <b-col md="6">
                    <b-form-group
                        label="Background URL"
                        description="This background image is shown on the login page users see when claiming your crypto or NFT's."
                    >
                        <b-form-file @change="onUpload($event, 'backgroundImgUrl')" accept="image/*" />
                    </b-form-group>
                </b-col>
                <b-col>
                    <label>Preview</label>
                    <b-card body-class="py-5 text-center" class="mb-3" bg-variant="light">
                        <img
                            width="100%"
                            class="m-0"
                            alt="Signin page background image"
                            :src="backgroundImgUrl"
                            v-if="backgroundImgUrl"
                        />
                        <span v-else class="text-gray">Preview background URL.</span>
                    </b-card>
                </b-col>
            </b-form-row>
            <hr />
            <div class="d-flex justify-content-end">
                <b-button variant="link" @click="onClickPreview"> Preview </b-button>
                <b-button variant="primary" :disabled="!isBrandUpdateInvalid" @click="update()" class="rounded-pill">
                    <b-spinner v-if="loading" class="mr-2" small variant="white" />
                    <span>Update</span>
                </b-button>
            </div>
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
import { BASE_URL } from '@thxnetwork/dashboard/utils/secrets';

@Component({
    computed: mapGetters({
        brands: 'brands/all',
        pools: 'pools/all',
    }),
})
export default class SettingsView extends Vue {
    ChainId = ChainId;
    loading = true;
    chainInfo = chainInfo;
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';

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

    onClickPreview() {
        window.open(`${BASE_URL}/preview/${this.pool._id}`, '_blank');
    }

    async onUpload(event: any, key: string) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this, key, publicUrl);
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
}
</script>
