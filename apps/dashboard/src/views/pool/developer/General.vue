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
                <strong>Campaign Widget</strong>
                <p class="text-muted">
                    Place this script in HTML page and your campaign widget will show for your web page visitors.
                </p>
                <p class="text-muted">
                    Alternatively you can use the
                    <b-link target="_blank" href="https://www.npmjs.com/package/@thxnetwork/sdk">
                        @thxnetwork/sdk
                    </b-link>
                    for this.
                </p>
            </b-col>
            <b-col md="8">
                <b-alert variant="danger" show v-if="widget && !widget.active">
                    <i class="fas fa-exclamation-circle mr-2"></i> <strong>No domain activity detected.</strong> Please
                    add the script below to your HTML page.
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
                <strong>Origin</strong>
                <div class="text-muted">Configure the domain the widget will be loaded on.</div>
            </b-col>
            <b-col md="8">
                <b-form-group :state="isValidDomain">
                    <b-form-input
                        @change="onChangeDomain"
                        v-model="domain"
                        :state="isValidDomain"
                        placeholder="https://www.example.com"
                    />
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
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { IWidgets } from '@thxnetwork/dashboard/store/modules/widgets';
import { AccountVariant } from '@thxnetwork/common/enums';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';

@Component({
    components: {
        BaseCodeExample,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
            widgets: 'widgets/all',
        }),
    },
})
export default class SettingsView extends Vue {
    loading = true;
    isValidUrl = isValidUrl;
    chainInfo = chainInfo;
    profile!: TAccount;
    pools!: IPools;
    widgets!: IWidgets;
    error: string | null = null;
    domain = '';
    selectedAuthenticationMethods: AccountVariant[] = [];
    authenticationMethods = [
        { key: AccountVariant.EmailPassword, text: 'Email/Password' },
        { key: AccountVariant.Metamask, text: 'Metamask' },
        { key: AccountVariant.SSODiscord, text: 'Discord' },
        { key: AccountVariant.SSOGithub, text: 'Github' },
        { key: AccountVariant.SSOGoogle, text: 'Google' },
        { key: AccountVariant.SSOTwitch, text: 'Twitch' },
        { key: AccountVariant.SSOTwitter, text: 'Twitter' },
    ];

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get widget() {
        if (!this.widgets[this.$route.params.id]) return;
        return Object.values(this.widgets[this.$route.params.id])[0];
    }

    get isValidDomain() {
        return this.domain ? isValidUrl(this.domain) : null;
    }

    async mounted() {
        this.$store.dispatch('widgets/list', this.pool).then(async () => {
            if (!this.widget) return;
            this.domain = this.widget.domain;
        });
        this.selectedAuthenticationMethods = this.pool.settings.authenticationMethods;
        this.loading = false;
    }

    async onChangeSettings(setting?: TPoolSettings) {
        if (!this.selectedAuthenticationMethods.length) {
            this.error = 'Select at least one login method';
            return;
        }

        const settings = Object.assign(
            { ...this.pool.settings, authenticationMethods: this.selectedAuthenticationMethods.sort((a, b) => a - b) },
            setting,
        );

        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings },
        });

        this.error = '';
    }

    async onChangeDomain(url: string) {
        if (!isValidUrl(url)) return;
        this.loading = true;
        const domain = new URL(url);
        await this.$store.dispatch('widgets/update', { ...this.widget, domain: domain.origin });
        this.domain = url;
        this.loading = false;
    }
}
</script>
