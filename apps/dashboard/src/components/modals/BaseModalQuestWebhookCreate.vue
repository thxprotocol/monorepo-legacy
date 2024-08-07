<template>
    <BaseModalQuestCreate
        label="Webhook Quest"
        @show="onShow"
        @submit="onSubmit"
        :id="id"
        :pool="pool"
        :quest="quest"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :error="error"
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
    isLoading = false;
    isVisible = true;
    error = '';
    amount = 0;
    webhook: TWebhook | null = null;
    metadata = '';
    isAmountCustom = false;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestWebhook;

    onShow() {
        this.amount = this.quest ? this.quest.amount : this.amount;
        this.metadata = this.quest ? this.quest.metadata : this.metadata;
        this.isAmountCustom = this.quest ? this.quest.isAmountCustom : this.isAmountCustom;
        this.webhook = this.quest
            ? this.pool.webhooks.find((webhook) => webhook._id === this.quest.webhookId) || null
            : null;
    }

    get isSubmitDisabled() {
        return !this.webhook;
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: QuestVariant.Webhook,
                amount: this.amount,
                webhookId: this.webhook?._id,
                metadata: this.metadata,
                isAmountCustom: this.isAmountCustom,
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit', { isPublished: payload.isPublished });
        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
