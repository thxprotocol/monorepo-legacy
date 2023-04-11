<template>
    <div>
        <b-form-row v-if="error">
            <b-col md="4"></b-col>
            <b-col md="4">
                <b-alert variant="danger" show>
                    {{ error }}
                </b-alert>
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4">
                <strong>Authentication Methods</strong>
                <div class="text-muted">Configure the autxwhentication methods available for the user</div>
            </b-col>
            <b-col md="8">
                <b-form-checkbox-group
                    v-model="selectedAuthenticationMethods"
                    :options="authenticationMethods"
                    value-field="key"
                    text-field="text"
                    @change="onChangeaAthenticationMethods"
                >
                </b-form-checkbox-group>
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4">
                <strong>Embed code</strong>
                <p class="text-muted">
                    Place this code before the closing body tag of your HTML page. The launcher will show for your web
                    page visitors.<br />
                    <b-link target="_blank" href="https://www.npmjs.com/package/@thxnetwork/sdk"> Download SDK </b-link>
                </p>
            </b-col>
            <b-col md="8">
                <b-alert variant="danger" show v-if="widget && !widget.active">
                    <i class="fas fa-wifi mr-2"></i> <strong>No domain activity!</strong> Please add the script below in
                    the &lt;head&gt; of your HTML page.
                </b-alert>
                <b-alert v-else variant="success" show>
                    <i class="fas fa-wifi mr-2"></i> <strong>Widget is active!</strong> Make sure to update rewards
                    frequently.
                </b-alert>
                <BaseCodeExample :pool="pool" />
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Domain</strong>
                <div class="text-muted">Configure the domain the widget will be loaded on.</div>
            </b-col>
            <b-col md="8">
                <b-form-input @change="onChangeWidget" v-model="domain" />
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Title</strong>
                <div class="text-muted">Used in e-mail notifications towards your audience.</div>
            </b-col>
            <b-col md="8">
                <b-form-input @change="onChangeSettings" v-model="title" class="mr-3 mb-0" />
            </b-col>
        </b-form-row>
        <hr />
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
        <hr />
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
        <hr />
        <b-form-row>
            <b-col md="4"> </b-col>
            <b-col md="8">
                <b-form-group>
                    <b-form-group>
                        <b-form-checkbox @change="onChangeSettings" v-model="isWeeklyDigestEnabled" class="mr-3">
                            <strong>Weekly Digest</strong><br />
                            <span class="text-muted">
                                Every week on monday we will send you the latest activity metrics for this loyalty pool.
                            </span>
                        </b-form-checkbox>
                    </b-form-group>
                    <b-form-group>
                        <b-form-checkbox @change="onChangeSettings" v-model="isArchived" class="mr-3">
                            <strong>Archived</strong><br />
                            <span class="text-muted"> Hide this pool in your overview of pools. </span>
                        </b-form-checkbox>
                    </b-form-group>
                </b-form-group>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { TBrand } from '@thxnetwork/dashboard/store/modules/brands';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { TPoolSettings } from '@thxnetwork/types/interfaces';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';
import { IWidgets } from '@thxnetwork/dashboard/store/modules/widgets';
import { AccountVariant } from '@thxnetwork/dashboard/types/enums/AccountVariant';

@Component({
    components: {
        BaseCodeExample,
    },
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
            widgets: 'widgets/all',
        }),
    },
})
export default class SettingsView extends Vue {
    loading = true;
    chainInfo = chainInfo;
    profile!: IAccount;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    widgets!: IWidgets;
    error: string | null = null;
    title = '';
    domain = '';
    logoImgUrl = '';
    backgroundImgUrl = '';
    isWeeklyDigestEnabled = false;
    isArchived = false;
    selectedAuthenticationMethods: AccountVariant[] = [];

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

    get widget() {
        if (!this.widgets[this.$route.params.id]) return;
        return Object.values(this.widgets[this.$route.params.id])[0];
    }

    get authenticationMethods(): { key: number; text: string }[] {
        return [
            { key: AccountVariant.EmailPassword, text: 'Email/Password' },
            { key: AccountVariant.Metamask, text: 'Metamask' },
            { key: AccountVariant.SSODiscord, text: 'Discord' },
            { key: AccountVariant.SSOGithub, text: 'Github' },
            { key: AccountVariant.SSOGoogle, text: 'Google' },
            { key: AccountVariant.SSOTwitch, text: 'Twitch' },
            { key: AccountVariant.SSOTwitter, text: 'Twitter' },
        ];
    }

    async mounted() {
        this.$store.dispatch('widgets/list', this.pool).then(async () => {
            if (!this.widget) return;
            this.domain = this.widget.domain;
        });

        this.$store.dispatch('brands/getForPool', this.pool._id).then(async () => {
            if (!this.brand) return;
            this.backgroundImgUrl = this.brand.backgroundImgUrl;
            this.logoImgUrl = this.brand.logoImgUrl;
        });

        this.title = this.pool.settings.title;
        this.isArchived = this.pool.settings.isArchived;
        this.isWeeklyDigestEnabled = this.pool.settings.isWeeklyDigestEnabled;
        this.selectedAuthenticationMethods = this.pool.settings.authenticationMethods;
        this.loading = false;
    }

    async upload(file: File) {
        return await this.$store.dispatch('images/upload', file);
    }

    async onUpload(event: any, key: string) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this, key, publicUrl);
        await this.updateBrand();
    }

    async onClickRemoveBackground() {
        this.backgroundImgUrl = '';
        await this.updateBrand();
    }

    async onClickRemoveLogo() {
        this.logoImgUrl = '';
        await this.updateBrand();
    }

    async onChangeSettings(setting: TPoolSettings) {
        const settings = Object.assign(
            {
                title: this.title,
                isArchived: this.isArchived,
                isWeeklyDigestEnabled: this.isWeeklyDigestEnabled,
            },
            setting,
        );

        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings },
        });
    }

    async updateBrand() {
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

    async onChangeWidget() {
        this.loading = true;
        await this.$store.dispatch('widgets/update', {
            ...this.widget,
            domain: this.domain,
        });
        this.loading = false;
    }

    async onChangeaAthenticationMethods() {
        this.error = null;
        if (!this.selectedAuthenticationMethods.length) {
            this.error = 'Select at least one Athentication Method';
            return;
        }
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings: { authenticationMethods: this.selectedAuthenticationMethods.sort((a, b) => a - b) } },
        });
    }
}
</script>
