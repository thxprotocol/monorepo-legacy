<template>
    <BaseModalQuestCreate
        variant="Webhook Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        @change-date="expiryDate = $event"
        @change-locks="locks = $event"
        :published="isPublished"
        :id="id"
        :error="error"
        :info-links="infoLinks"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :quest="reward"
        :pool="pool"
    >
        <template #col-left>
            <BaseFormGroup
                required
                label="Amount"
                tooltip="The amount of points the campaign participant will earn for completing this quest."
            >
                <b-form-input type="number" :disabled="isAmountCustom" v-model="amount" class="mb-2" />
                <b-form-checkbox v-model="isAmountCustom" class="text-muted">
                    Enable custom <code>amount</code> in webhook response
                </b-form-checkbox>
            </BaseFormGroup>
            <BaseFormGroup required label="Webhook" tooltip="Select a webhook to trigger when the quest is completed.">
                <BaseDropdownWebhook :pool="pool" :webhook="webhook" @click="webhook = $event" />
            </BaseFormGroup>
            <BaseFormGroup
                label="Metadata"
                tooltip="Provide static metadata for your system to consume when validating the request."
            >
                <b-textarea v-model="metadata" />
            </BaseFormGroup>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { QuestVariant } from '@thxnetwork/common/enums';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';
import BaseDropdownWebhook from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownWebhook.vue';

@Component({
    components: {
        BaseModalQuestCreate,
        BaseDropdownWebhook,
    },
})
export default class ModalQuestWebhookCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    isPublished = false;
    error = '';
    title = '';
    image = '';
    file: File | null = null;
    description = '';
    amount = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    expiryDate: Date | string = '';
    locks: TQuestLock[] = [];
    webhook: TWebhook | null = null;
    webhookId = '';
    metadata = '';
    isAmountCustom = false;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestWebhook;

    async onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
        this.metadata = this.reward ? this.reward.metadata : this.metadata;
        this.isAmountCustom = this.reward ? this.reward.isAmountCustom : this.isAmountCustom;

        this.webhookId = this.reward ? this.reward.webhookId : '';
        this.webhook = this.webhookId
            ? this.pool.webhooks.find((webhook) => webhook._id === this.webhookId) || null
            : null;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                variant: QuestVariant.Webhook,
                page: 1,
                index: this.reward ? this.reward.index : this.total,
                isPublished: this.isPublished,
                poolId: String(this.pool._id),
                file: this.file,
                title: this.title,
                description: this.description,
                amount: this.amount,
                expiryDate: this.expiryDate,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                locks: JSON.stringify(this.locks),
                webhookId: this.webhook?._id,
                metadata: this.metadata,
                isAmountCustom: this.isAmountCustom,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit', { isPublished: this.isPublished });
                this.isLoading = false;
            });
    }
}
</script>
