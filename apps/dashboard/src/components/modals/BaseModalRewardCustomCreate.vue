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
        <b-form-group label="Webhook">
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
        </b-form-group>
        <b-form-group label="Metadata" description="Provide metadata for your system to use.">
            <b-textarea v-model="metadata" />
        </b-form-group>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { TBaseReward, TCustomReward, TPool, TWebhook } from '@thxnetwork/types/interfaces';
import { TWebhookState } from '@thxnetwork/dashboard/store/modules/webhooks';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';

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
    @Prop({ required: false }) reward!: TCustomReward;

    get webhookList() {
        if (!this.webhooks[this.pool._id]) return [];
        return Object.values(this.webhooks[this.pool._id]);
    }

    async onShow() {
        this.metadata = this.reward ? this.reward.metadata : this.metadata;
        this.webhookId = this.reward ? this.reward.webhookId : '';

        await this.$store.dispatch('webhooks/list', this.pool);
        this.webhook = this.webhooks[this.pool._id][this.webhookId];
    }

    async onSubmit(payload: TBaseReward) {
        if (!this.webhook) {
            this.error = 'Choose a webhook';
            return;
        }
        this.isLoading = true;
        try {
            await this.$store.dispatch(`rewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                ...payload,
                webhookId: this.webhook._id,
                metadata: this.metadata,
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit');
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
