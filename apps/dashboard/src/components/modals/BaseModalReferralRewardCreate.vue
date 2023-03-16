<template>
    <base-modal @show="onShow" size="xl" title="Create Referral Reward" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Referral rewards incentive your existing users to attract new users and will drive down your customer
                acquisition costs.
            </p>
            <form v-on:submit.prevent="onSubmit" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input v-model="amount" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardURLQualify
                            :visible="isVisibleCardURLQualify"
                            :url="successUrl"
                            @input="successUrl = $event"
                        />
                        <BaseCardURLWebhook
                            :visible="isVisibleCardWebhookQualify"
                            :code="code"
                            title="Webhook Qualification"
                            description="You can also choose to run this webhook to qualify the referral and trigger a point transfer."
                        >
                            <template #alerts>
                                <b-alert show variant="info">
                                    <i class="fas fa-question-circle mr-2"></i> Take note of these development
                                    guidelines:
                                    <ul class="px-3 mb-0 mt-1 small">
                                        <li v-if="!reward">
                                            <strong>REFERRAL_TOKEN</strong> will be populated after creating this
                                            referral reward.
                                        </li>
                                        <li>
                                            <strong>REFERRAL_CODE</strong> should be derived from the
                                            <code>$_GET['ref']</code>
                                            value in the referral URL used on your site.
                                        </li>
                                    </ul>
                                </b-alert>
                            </template>
                        </BaseCardURLWebhook>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardPointsCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Referral Reward' : 'Create Referral Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import Shell from 'highlight.js/lib/languages/shell';
import { mapGetters } from 'vuex';
import { UserProfile } from 'oidc-client-ts';
import { type TPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TReferralReward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import { API_URL } from '../../../../wallet/src/utils/secrets';
import BaseCardURLQualify from '@thxnetwork/dashboard/components/BaseCardURLQualify.vue';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/BaseCardURLWebhook.vue';

hljs.registerLanguage('shell', Shell);

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLQualify,
        BaseCardURLWebhook,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalReferralRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisibleCardURLQualify = true;
    isVisibleCardWebhookQualify = false;
    isCopied = false;
    error = '';
    title = '';
    amount = '0';
    successUrl = '';
    description = '';
    claimAmount = 1;
    profile!: UserProfile;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TReferralReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/referral/${this.reward ? this.reward.token : '<REFERRAL_TOKEN>'}/qualify" \\
-X POST \\
-d "code=<REFERRAL_CODE>"`;
    }

    get codeExample() {
        return hljs.highlight(this.code, { language: 'shell' }).value;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.amount = this.reward ? String(this.reward.amount) : '0';
        this.description = this.reward ? this.reward.description : '';
        this.successUrl = this.reward ? this.reward.successUrl : '';
        this.isVisibleCardURLQualify = this.reward ? !!this.reward.successUrl : true;
        this.isVisibleCardWebhookQualify = this.reward ? !this.reward.successUrl : false;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`referralRewards/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    poolId: String(this.pool._id),
                    title: this.title,
                    description: this.description,
                    amount: this.amount,
                    claimAmount: this.claimAmount,
                    successUrl: this.successUrl && this.successUrl.length ? this.successUrl : undefined,
                },
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
