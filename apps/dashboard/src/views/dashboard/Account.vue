<template>
    <div>
        <div class="container-xl">
            <b-jumbotron
                class="mt-3 jumbotron-header"
                bg-variant="light"
                :style="{
                    'min-height': 'none',
                    'border-radius': '1rem',
                    'background-size': 'cover',
                    'background-image': `url(${require('@thxnetwork/dashboard/../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">Account</p>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">
            <b-card no-body>
                <b-tabs card pills active-nav-item-class="rounded-pill">
                    <b-tab>
                        <b-alert v-if="error" show variant="danger">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            {{ error }}
                        </b-alert>
                        <template #title> <i class="fas fa-user ml-0 mr-2"></i> Profile </template>
                        <BaseFormGroup label="Username">
                            <b-form-input v-model="username" :state="isValidUsername" @change="onChange" />
                        </BaseFormGroup>
                        <BaseFormGroup label="E-mail">
                            <b-form-input v-model="email" :state="isValidEmail" @change="onChange" />
                        </BaseFormGroup>
                        <BaseFormGroup label="Account ID">
                            <b-input-group>
                                <b-form-input readonly disabled :value="account.sub" />
                                <template #append>
                                    <b-button variant="dark" v-clipboard:copy="account.sub">
                                        <i class="fas fa-clipboard mx-1"></i>
                                    </b-button>
                                </template>
                            </b-input-group>
                        </BaseFormGroup>
                        <BaseFormGroup label="Provider User ID">
                            <b-input-group>
                                <b-form-input readonly disabled :value="account.providerUserId" />
                                <template #append>
                                    <b-button variant="dark" v-clipboard:copy="account.providerUserId">
                                        <i class="fas fa-clipboard mx-1"></i>
                                    </b-button>
                                </template>
                            </b-input-group>
                        </BaseFormGroup>
                    </b-tab>
                    <b-tab>
                        <template #title> <i class="fas fa-user-plus ml-0 mr-2"></i> Connected </template>
                        <BaseFormGroupConnectedProvider
                            :key="key"
                            :provider="provider"
                            v-for="(provider, key) of providers"
                        />
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccessTokenKind, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import { validateEmail } from '@thxnetwork/dashboard/utils/email';
import BaseFormGroupConnectedProvider from '@thxnetwork/dashboard/components/form-group/BaseFormGroupConnectedProvider.vue';
import BaseFormGroup from '@thxnetwork/dashboard/components/form-group/BaseFormGroup.vue';

@Component({
    components: {
        BaseFormGroup,
        BaseFormGroupConnectedProvider,
    },
    computed: {
        ...mapGetters({
            account: 'account/profile',
        }),
    },
})
export default class App extends Vue {
    account!: TAccount;
    username = '';
    email = '';
    error = '';
    currentTab = 0;
    isLoading = false;

    mounted() {
        this.username = this.account.username || this.username;
        this.email = this.account.email || this.email;
    }

    get isValidEmail() {
        if (this.email === this.account.email) return null;
        return !!validateEmail(this.email);
    }

    get isValidUsername() {
        if (this.username === this.account.username) return null;
        return this.username.length > 5;
    }

    get providers() {
        return {
            [AccessTokenKind.Google]: {
                kind: AccessTokenKind.Google,
                scopes: OAuthRequiredScopes.GoogleAuth,
                label: 'YouTube (Google)',
                color: '#FF0000',
            },
            [AccessTokenKind.Twitter]: {
                kind: AccessTokenKind.Twitter,
                scopes: OAuthRequiredScopes.TwitterAuth,
                label: 'Twitter',
                color: '#1DA1F2',
            },
            [AccessTokenKind.Discord]: {
                kind: AccessTokenKind.Discord,
                scopes: OAuthRequiredScopes.DiscordAuth,
                label: 'Discord',
                color: '#7289DA',
            },
        };
    }

    async onChange() {
        this.error = '';
        this.isLoading = true;
        try {
            if (this.isValidEmail === false) throw new Error('E-mail is not valid');
            if (this.isValidUsername === false) throw new Error('Username is not valid');

            await this.$store.dispatch('account/update', {
                username: this.username,
                email: this.email,
            });
            this.error = '';
        } catch (error: any) {
            console.error(error);
            if (error.response) {
                this.error = error.response.data.error.message;
            } else {
                this.error = error.message;
            }
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
