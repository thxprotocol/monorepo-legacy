<template>
    <div>
        <h2 class="">Theme</h2>
        <b-card class="shadow-sm mb-5">
            <b-form-row>
                <b-col md="6">
                    <label> Background URL </label>
                    <p class="text-muted small">
                        This background image is shown on the login page users see when claiming your crypto or NFT's.
                    </p>
                    <b-form-file @change="onUpload" :data-key="backgroundImgUrl" accept="image/*" />
                </b-col>
                <b-col>
                    <label>Preview</label>
                    <b-card body-class="py-3 text-center" class="mb-3" bg-variant="light">
                        <img width="100%" class="m-0" :src="backgroundImgUrl" v-if="backgroundImgUrl" />
                        <span v-else class="text-gray">Please provide and image URL.</span>
                    </b-card>
                </b-col>
            </b-form-row>
            <hr />
            <b-form-row>
                <b-col md="6">
                    <label> Logo URL </label>
                    <p class="text-muted small">
                        This logo image is shown above the login panel users see when claiming your crypto or NFT's.
                    </p>
                    <b-form-file @change="onUpload" :data-key="logoImgUrl" accept="image/*" />
                </b-col>
                <b-col>
                    <label>Preview</label>
                    <b-card body-class="py-3 text-center" class="mb-3" bg-variant="light">
                        <img height="65" width="65" class="m-0" :src="logoImgUrl" v-if="logoImgUrl" />
                        <span v-else class="text-gray">Please provide and image URL.</span>
                    </b-card>
                </b-col>
            </b-form-row>
            <hr />
            <div class="d-flex justify-content-end">
                <b-button variant="primary" :disabled="!isBrandUpdateInvalid" @click="update()" class="rounded-pill">
                    Update
                    <i v-if="!loading" class="fas fa-save ml-2" style="font-size: 1.2rem"></i>
                    <b-spinner v-else class="ml-2" small variant="white" />
                </b-button>
            </div>
        </b-card>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxprotocol/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '@thxprotocol/dashboard/types/enums/ChainId';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxprotocol/dashboard/utils/url';
import { TBrand } from '@thxprotocol/dashboard/store/modules/brands';

@Component({
    computed: mapGetters({
        brands: 'brands/all',
        pools: 'pools/all',
    }),
})
export default class AssetPoolView extends Vue {
    ChainId = ChainId;
    loading = true;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    chainId: ChainId = ChainId.PolygonMumbai;
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

    mounted() {
        this.chainId = this.pool.chainId;
        this.get().then(() => {
            this.loading = false;
        });
    }

    async upload(file: File) {
        const publicUrl = await this.$store.dispatch('images/upload', file);
        return publicUrl;
    }

    get brand() {
        return this.brands[this.$route.params.id];
    }

    async get() {
        await this.$store.dispatch('brands/getForPool', this.pool);
        if (this.brand) {
            this.backgroundImgUrl = this.brand.backgroundImgUrl;
            this.logoImgUrl = this.brand.logoImgUrl;
        }
    }

    async onUpload(event: any) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this, event.target.dataset['key'], publicUrl);
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
