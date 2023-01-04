<template>
    <base-modal size="xl" title="Create Referral Reward" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <template v-if="reward && reward.token">
                <p class="text-gray">
                    Referral rewards incentive your existing users to attract new users and will drive down your
                    customer acquisition costs.
                </p>
                <strong>Code</strong>
                <p class="text-muted">
                    Make a post call to this url to generate a webhook that will qualify the reward
                </p>
                <pre class="rounded text-white p-3 d-flex align-items-center bg-dark" style="white-space: nowrap">
                <b-button 
                    variant="light" 
                    v-clipboard:copy="code"
                    v-clipboard:success="() => isCopied = true" size="sm" class="mr-3">
                    <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                </b-button>
                <code class="language-html" v-html="codeExample"></code>
            </pre>
            </template>
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
                        <b-card body-class="bg-light p-0">
                            <b-button
                                class="d-flex align-items-center justify-content-between w-100"
                                variant="light"
                                v-b-toggle.collapse-card-expiry
                            >
                                <strong>URL Qualification</strong>
                                <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
                            </b-button>
                            <b-collapse id="collapse-card-expiry" v-model="isVisible">
                                <hr class="mt-0" />
                                <div class="px-3">
                                    <b-form-group label="Success URL">
                                        <b-form-input v-model="successUrl" />
                                        <p class="small text-muted mt-2 mb-0">
                                            When the user receiving the referral URL comes across this URL the referral
                                            will be marked as successful.
                                            <strong>E.g. https://example.com/thanks-for-your-signup</strong>
                                        </p>
                                    </b-form-group>
                                    <b-alert show variant="warning">
                                        <i class="fas fa-exclamation-circle mr-2"></i>
                                        <strong class="mr-2">Important:</strong>Make sure the loyalty widget is running
                                        on your success page.
                                    </b-alert>
                                    <hr />
                                    <p class="text-muted font-italic">
                                        Backend integration for completing referral rewards will be available soon.
                                    </p>
                                </div>
                            </b-collapse>
                        </b-card>
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
                {{ reward ? 'Update Reward' : 'Create Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import { mapGetters } from 'vuex';
import { UserProfile } from 'oidc-client-ts';
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TReferralReward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import { API_URL } from '../../../../wallet/src/utils/secrets';

hljs.registerLanguage('xml', XML);

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalReferralRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    amount = '0';
    successUrl = '';
    description = '';
    claimAmount = 1;
    isCopied = false;
    profile!: UserProfile;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TReferralReward;

    get code() {
        if (!this.reward) {
            return '';
        }
        return `curl "${API_URL}/v1/webhook/referral/${this.reward.token}/qualify" -X POST -d "code=${this.profile.sub}"`;
    }

    get codeExample() {
        if (!this.reward) {
            return '';
        }
        return hljs.highlight(this.code, { language: 'xml' }).value;
    }

    mounted() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = String(this.reward.amount);
            this.description = this.reward.description;
            this.successUrl = this.reward.successUrl;
        }
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
                    successUrl: this.successUrl,
                },
            })
            .then(() => {
                this.$emit('submit');
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
