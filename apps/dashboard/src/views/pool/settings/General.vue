<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Logo</strong>
                <p class="text-muted">
                    Used as logo on auth.thx.network, Discord Bot messages and your widget welcome message.
                </p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="8">
                        <b-form-group>
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
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4">
                <strong>Background</strong>
                <p class="text-muted">Used as background on auth.thx.network when authenticating for your widget.</p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="8">
                        <b-form-group>
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
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
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
}
</script>
