<template>
    <base-modal @show="onShow" size="xl" title="Create Milestone Reward" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formRewardMilestoneCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input type="number" v-model="amount" />
                        </b-form-group>
                        <b-form-group label="Limit">
                            <b-form-input type="number" v-model="limit" min="0" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardURLWebhook
                            :code="code"
                            title="Webhook Qualification"
                            description="Run this webhook to qualify an account wallet address for the claim of this reward."
                        >
                            <template #alerts>
                                <b-alert show variant="info">
                                    <i class="fas fa-question-circle mr-2"></i> Take note of these development
                                    guidelines:
                                    <ul class="px-3 mb-0 mt-1 small">
                                        <li v-if="!reward">
                                            <strong>TOKEN</strong> will be populated after creating this reward.
                                        </li>
                                        <li>
                                            <strong>ADDRESS</strong> should be provided by your app and owned by the
                                            targeted user in our system.
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
                form="formRewardMilestoneCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Milestone Reward' : 'Create Milestone Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TMilestoneReward } from '@thxnetwork/types/index';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardURLWebhook from '../BaseCardURLWebhook.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLWebhook,
    },
})
export default class ModalMilestoneRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    description = '';
    amount = 0;
    limit = 0;
    isCopied = false;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TMilestoneReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/milestone/${this.reward ? this.reward.uuid : '<TOKEN>'}/claim" \\
-X POST \\
-d "address=<ADDRESS>"`;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.limit = this.reward && this.reward.limit ? this.reward.limit : this.limit;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`milestoneRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                page: 1,
                poolId: String(this.pool._id),
                title: this.title,
                description: this.description,
                amount: this.amount,
                limit: this.limit,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
