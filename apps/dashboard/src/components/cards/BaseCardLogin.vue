<template>
    <b-container class="m-auto">
        <b-row>
            <b-col md="6" offset-md="3">
                <b-card>
                    <template v-if="!isEmailSent">
                        <BaseFormGroup label="Use your e-mail">
                            <b-form-input v-model="email" placeholder="yourname@example.com" />
                        </BaseFormGroup>
                        <b-button :disabled="!isEmailValid" variant="primary" block @click="onClickSigninWithOTP">
                            <b-spinner small v-if="isLoadingOTP" />
                            <template v-else>
                                Send one-time password
                                <i class="fas fa-chevron-right" />
                            </template>
                        </b-button>
                    </template>
                    <template v-else>
                        <BaseFormGroup label="Check your e-mail for the OTP">
                            <b-form-input v-model="otp" placeholder="******" />
                        </BaseFormGroup>
                        <b-button :disabled="!isOTPValid" variant="primary" block @click="onClickVerifyOTP">
                            <b-spinner small v-if="isLoadingOTPVerify" />
                            <template v-else>
                                Verify OTP
                                <i class="fas fa-chevron-right" />
                            </template>
                        </b-button>
                    </template>
                    <hr />
                    <BaseFormGroup label="Use a trusted provider">
                        <b-button
                            variant="primary"
                            :title="provider.title"
                            :key="key"
                            v-for="(provider, key) of providers"
                            class="mr-2"
                            @click="onClickSigninWithOAuth(provider.variant)"
                        >
                            <b-spinner small v-if="provider.isLoading" />
                            <i v-else :class="provider.icon" class="m-0" style="font-size: 1rem" />
                        </b-button>
                    </BaseFormGroup>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { providerIconMap } from '@thxnetwork/common/maps';
import { AccessTokenKind, AccountVariant } from '@thxnetwork/common/enums';
import { validateEmail } from '@thxnetwork/dashboard/utils/email';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class BaseCardLeaderboard extends Vue {
    account!: TAccount;
    email = '';
    otp = '';
    error = '';
    providers = {
        [AccountVariant.SSOGoogle]: {
            kind: AccessTokenKind.Google,
            variant: AccountVariant.SSOGoogle,
            icon: providerIconMap[AccessTokenKind.Google],
            title: 'Sign in with Google',
            isLoading: false,
        },
        [AccountVariant.SSOTwitter]: {
            kind: AccessTokenKind.Twitter,
            variant: AccountVariant.SSOTwitter,
            icon: providerIconMap[AccessTokenKind.Twitter],
            title: 'Sign in with Twitter',
            isLoading: false,
        },
        [AccountVariant.SSODiscord]: {
            kind: AccessTokenKind.Discord,
            variant: AccountVariant.SSODiscord,
            icon: providerIconMap[AccessTokenKind.Discord],
            title: 'Sign in with Discord',
            isLoading: false,
        },
        [AccountVariant.SSOTwitch]: {
            kind: AccessTokenKind.Twitch,
            variant: AccountVariant.SSOTwitch,
            icon: providerIconMap[AccessTokenKind.Twitch],
            title: 'Sign in with Twitch',
            isLoading: false,
        },
        [AccountVariant.SSOGithub]: {
            kind: AccessTokenKind.Github,
            variant: AccountVariant.SSOGithub,
            icon: providerIconMap[AccessTokenKind.Github],
            title: 'Sign in with Github',
            isLoading: false,
        },
    };
    isLoadingOTP = false;
    isLoadingOTPVerify = false;
    isEmailSent = false;

    get isEmailValid() {
        if (!this.email) return false;
        return validateEmail(this.email);
    }

    get isOTPValid() {
        return this.otp.length === 6;
    }

    async onClickSigninWithOTP() {
        this.isLoadingOTP = true;
        try {
            await this.$store.dispatch('auth/signInWithOtp', { email: this.email });
            this.isEmailSent = true;
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.isLoadingOTP = false;
        }
    }

    async onClickVerifyOTP() {
        this.isLoadingOTPVerify = false;
        try {
            await this.$store.dispatch('auth/verifyOtp', { email: this.email, token: this.otp });
            if (this.account) {
                this.$router.push({ name: 'dashboard' });
            }
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.isLoadingOTPVerify = false;
        }
    }

    async onClickSigninWithOAuth(variant: AccountVariant) {
        this.providers[variant].isLoading = true;
        try {
            await this.$store.dispatch('auth/signinWithOAuth', { variant, skipBrowserRedirect: false });
            if (this.account) {
                this.$router.push({ name: 'dashboard' });
            }
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.providers[variant].isLoading = false;
        }
    }
}
</script>
