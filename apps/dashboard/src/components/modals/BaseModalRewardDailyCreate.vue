<template>
    <base-modal size="xl" title="Create Daily Reward" :id="id" :error="error" :loading="isLoading" @show="onShow">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">Daily rewards are distributed to your customers every 24 hours</p>
            <form v-on:submit.prevent="onSubmit()" id="formRewardDailyCreate">
                <b-row>
                    <b-col>
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input v-model="amount" type="number" />
                        </b-form-group>
                        <b-form-group label="Qualification">
                            <b-form-checkbox v-model="isEnabledWebhookQualification">
                                Enable mandatory webhook qualification
                            </b-form-checkbox>
                        </b-form-group>
                    </b-col>
                    <b-col md="6" v-if="isEnabledWebhookQualification">
                        <BaseCardURLWebhook
                            :visible="true"
                            :code="code"
                            title="Webhook Qualification"
                            description="You can also choose to run this webhook to qualify the daily reward and trigger a point transfer."
                        >
                            <template #alerts>
                                <b-alert show variant="info">
                                    <i class="fas fa-question-circle mr-2"></i> Take note of these development
                                    guidelines:
                                    <ul class="px-3 mb-0 mt-1 small">
                                        <li v-if="!reward">
                                            <strong>TOKEN</strong> will be populated after creating this daily reward.
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
                form="formRewardDailyCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Daily Reward' : 'Create Daily Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { TPool } from '@thxnetwork/types/index';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';
import BaseModal from './BaseModal.vue';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import BaseCardURLWebhook from '../BaseCardURLWebhook.vue';

@Component({
    components: {
        BaseModal,
        BaseCardURLWebhook,
    },
    computed: mapGetters({
        totals: 'dailyRewards/totals',
    }),
})
export default class ModalRewardDailyCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = 0;
    description = '';
    limit = 0;
    isEnabledWebhookQualification = false;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TDailyReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/daily/${this.reward ? this.reward.uuid : '<TOKEN>'}" \\
-X POST \\
-d "address=<ADDRESS>"`;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.limit = this.reward ? this.reward.limit : this.limit;
        this.isEnabledWebhookQualification = this.reward
            ? this.reward.isEnabledWebhookQualification
            : this.isEnabledWebhookQualification;
    }

    onSubmit() {
        const payload = {
            ...this.reward,
            _id: this.reward ? this.reward._id : undefined,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            amount: this.amount,
            limit: this.limit,
            page: this.reward ? this.reward.page : 1,
            isEnabledWebhookQualification: this.isEnabledWebhookQualification,
        };
        this.isLoading = true;
        this.$store.dispatch(`dailyRewards/${this.reward ? 'update' : 'create'}`, payload).then(() => {
            this.$bvModal.hide(this.id);
            this.$emit('submit');
            this.isLoading = false;
        });
    }
}
</script>
