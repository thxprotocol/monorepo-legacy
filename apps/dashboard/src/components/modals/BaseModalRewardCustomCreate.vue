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
            <b-dropdown variant="link" class="dropdown-select" v-if="webhookList.length">
                <template #button-content>
                    <div class="d-flex align-items-center" v-if="webhook">
                        <i class="fas fa-globe text-muted mr-2"></i>
                        <span class="mr-1">{{ webhook.url }}</span>
                    </div>
                    <div v-else>Select a Webhook</div>
                </template>
                <b-dropdown-item-button :key="key" v-for="(w, key) of webhookList" @click="webhook = w">
                    {{ w.url }}
                </b-dropdown-item-button>
                <b-dropdown-divider />
            </b-dropdown>
            <b-button v-else variant="light" block :to="`/pool/${pool._id}/developer/webhooks`">
                Create Webhook
            </b-button>
        </BaseFormGroup>
        <BaseFormGroup label="Metadata" tooltip="Provide metadata for your system to use.">
            <b-textarea v-model="metadata" />
        </BaseFormGroup>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TWebhookState } from '@thxnetwork/dashboard/store/modules/webhooks';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';
import { RewardVariant } from '@thxnetwork/common/enums';

@Component({
    components: {
        BaseModalRewardCreate,
    },
    computed: mapGetters({
        webhooks: 'webhooks/all',
    }),
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

    get webhookList() {
        if (!this.webhooks[this.pool._id]) return [];
        return Object.values(this.webhooks[this.pool._id]);
    }

    async onShow() {
        this.metadata = this.reward ? this.reward.metadata : this.metadata;
        this.webhookId = this.reward ? this.reward.webhookId : '';

        await this.$store.dispatch('webhooks/list', this.pool);
        this.webhook = this.webhookId ? this.webhooks[this.pool._id][this.webhookId] : this.webhook;
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
