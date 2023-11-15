<template>
    <BaseModalQuestCreate
        variant="Custom Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-date="expiryDate = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        :published="isPublished"
        :id="id"
        :error="error"
        :info-links="infoLinks"
        :loading="isLoading"
        :disabled="isSubmitDisabled || !title"
        :quest="reward"
    >
        <template #col-left>
            <b-form-group label="Amount">
                <b-form-input type="number" v-model="amount" />
            </b-form-group>
            <b-form-group label="Limit" description="Maximum amount of claims per acount.">
                <b-form-input type="number" v-model="limit" min="0" />
            </b-form-group>
        </template>
        <template #col-right>
            <BaseCardURLWebhook
                class="mb-3"
                :code="code"
                title="Webhook Qualification"
                description="Run this webhook to qualify an account wallet address for the claim of this reward."
            >
                <template #alerts>
                    <b-alert show variant="info">
                        <i class="fas fa-question-circle mr-2"></i> Take note of these development guidelines:
                        <ul class="px-3 mb-0 mt-1 small">
                            <li v-if="!reward"><strong>TOKEN</strong> will be populated after creating this reward.</li>
                            <li>
                                <strong>CODE</strong> should be the virtual wallet code obtained for the user after
                                running the virtual wallet webhook
                            </li>
                        </ul>
                    </b-alert>
                </template>
            </BaseCardURLWebhook>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { TInfoLink, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TMilestoneReward } from '@thxnetwork/types/index';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
        BaseCardURLWebhook,
    },
})
export default class ModalQuestCustomCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    description = '';
    expiryDate: Date | number | null = null;
    isPublished = false;
    amount = 0;
    limit = 0;
    isCopied = false;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    file: File | null = null;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TMilestoneReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/milestone/${this.reward ? this.reward.uuid : '<TOKEN>'}/claim" \\
-X POST \\
-d "code=<CODE>"`;
    }

    onShow() {
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.limit = this.reward && this.reward.limit ? this.reward.limit : this.limit;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
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
                isPublished: this.isPublished,
                file: this.file,
                amount: this.amount,
                limit: this.limit,
                expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                index: !this.reward ? this.total : this.reward.index,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit');
                this.isLoading = false;
            });
    }
}
</script>
