<template>
    <b-card footer-class="text-right small">
        <b-alert show variant="primary" v-if="!signup">
            <i class="fas fa-info-circle ml-0 mr-2" />
            Don't worry, we'll create an account for you automatically.
        </b-alert>
        <b-alert show variant="primary" v-else>
            <i class="fas fa-info-circle ml-0 mr-2" />
            By continuing you accept THX Network's
            <b-link
                class="font-weight-bold"
                href="https://thx.network/general-terms-and-conditions.pdf"
                target="_blank"
            >
                Terms &amp; Conditions
            </b-link>
            and
            <b-link class="font-weight-bold" href="https://thx.network/privacy-policy.pdf" target="_blank">
                Privacy Policy </b-link
            >.
        </b-alert>

        <b-form @submit.prevent="onSubmitSigninWithOTP" v-if="!isEmailSent">
            <BaseFormGroup label="Use your e-mail">
                <b-form-input v-model="email" placeholder="yourname@example.com" />
            </BaseFormGroup>
            <b-button :disabled="!isEmailValid" variant="primary" block type="submit" class="rounded-pill">
                <b-spinner small v-if="isLoadingOTP" />
                <template v-else>
                    Send one-time password
                    <i class="fas fa-chevron-right" />
                </template>
            </b-button>
        </b-form>
        <b-form @submit.prevent="onSubmitVerifyOTP" v-else>
            <BaseFormGroup label="Check your e-mail for the OTP">
                <b-form-input v-model="otp" placeholder="******" />
            </BaseFormGroup>
            <b-button :disabled="!isOTPValid" variant="primary" block type="submit" class="rounded-pill">
                <b-spinner small v-if="isLoadingOTPVerify" />
                <template v-else>
                    Verify OTP
                    <i class="fas fa-chevron-right" />
                </template>
            </b-button>
        </b-form>
        <hr class="or-separator" />
        <BaseFormGroup label="Use a trusted provider">
            <b-button
                variant="primary"
                :title="provider.title"
                :key="key"
                v-for="(provider, key) of providers"
                class="mr-2 p-2 px-3"
                @click="onClickSigninWithOAuth(provider.variant)"
            >
                <b-spinner small v-if="provider.isLoading" />
                <i v-else :class="provider.icon" class="m-0" style="font-size: 1rem" />
            </b-button>
        </BaseFormGroup>
        <template #footer>
            <b-link class="ml-1" href="https://discord.com/invite/thx-network-836147176270856243" target="_blank">
                Help
            </b-link>
            <b-link class="ml-1" href="https://thx.network/privacy-policy.pdf" target="_blank"> Privacy </b-link>
            <b-link class="ml-1" href="https://thx.network/general-terms-and-conditions.pdf" target="_blank">
                Terms
            </b-link>
        </template>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { providerIconMap } from '@thxnetwork/common/maps';
import { AccessTokenKind, AccountVariant } from '@thxnetwork/common/enums';
import { validateEmail } from '@thxnetwork/dashboard/utils/email';
import { mapGetters } from 'vuex';
import { AccountPlanType } from '@thxnetwork/common/enums';

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

    @Prop() readonly signup!: boolean;
    @Prop() readonly plan!: AccountPlanType;

    get isEmailValid() {
        if (!this.email) return false;
        return validateEmail(this.email);
    }

    get isOTPValid() {
        return this.otp.length === 6;
    }

    async onSubmitSigninWithOTP() {
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

    async onSubmitVerifyOTP() {
        this.isLoadingOTPVerify = true;
        try {
            await this.$store.dispatch('auth/verifyOtp', { email: this.email, token: this.otp, plan: this.plan });
            if (!this.account) throw new Error('An issue occured while verifying OTP. Please try again.');
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.isLoadingOTPVerify = false;
        }
    }

    async onClickSigninWithOAuth(variant: AccountVariant) {
        this.providers[variant].isLoading = true;
        try {
            await this.$store.dispatch('auth/signinWithOAuth', {
                variant,
                plan: this.plan,
                skipBrowserRedirect: false,
            });
            if (!this.account) throw new Error('An issue occured while verifying OTP. Please try again.');
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.providers[variant].isLoading = false;
        }
    }
}
</script>
<style>
.or-separator {
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    margin: 2rem 0 1.5rem;
}
.or-separator:after {
    display: block;
    content: 'OR';
    background-color: #fff !important;
    color: gray;
    width: 40px;
    font-size: 0.8rem;
    margin-top: -0.7rem;
    margin-left: -20px;
    left: 50%;
    text-align: center;
    position: absolute;
}
.dark-mode .or-separator:after {
    background: #1f2129 !important;
}
</style>
