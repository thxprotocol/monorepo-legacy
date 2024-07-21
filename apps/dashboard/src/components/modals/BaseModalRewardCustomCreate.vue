<template>
    <BaseModalRewardCreate
        @show="onShow"
        @submit="onSubmit"
        :pool="pool"
        :id="id"
        :reward="reward"
        :error="error"
        :is-loading="isLoading"
    >
        <BaseFormGroup required label="Webhook" tooltip="Select a webhook to trigger when the quest is completed.">
            <BaseDropdownWebhook :pool="pool" :webhook="webhook" @click="webhook = $event" />
        </BaseFormGroup>
        <BaseFormGroup label="Metadata" tooltip="Provide metadata for your system to use.">
            <b-textarea v-model="metadata" />
        </BaseFormGroup>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardVariant } from '@thxnetwork/common/enums';
import BaseModalRewardCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCreate.vue';
import BaseDropdownWebhook from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownWebhook.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseDropdownWebhook,
    },
})
export default class ModalRewardCustomCreate extends Vue {
    isLoading = false;
    error = '';

    webhooks!: TWebhookState;
    webhook: TWebhook | null = null;
    webhookId = '';
    metadata = '';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TRewardCustom;

    async onShow() {
        this.metadata = this.reward ? this.reward.metadata : this.metadata;
        this.webhookId = this.reward ? this.reward.webhookId : '';

        this.webhookId = this.reward ? this.reward.webhookId : '';
        this.webhook = this.webhookId
            ? this.pool.webhooks.find((webhook) => webhook._id === this.webhookId) || null
            : null;
    }

    async onSubmit(payload: TReward) {
        if (!this.webhook) {
            this.error = 'Choose a webhook';
            return;
        }
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.Custom,
                webhookId: this.webhook._id,
                metadata: this.metadata,
            });
            this.$emit('submit', { isPublished: payload.isPublished });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
