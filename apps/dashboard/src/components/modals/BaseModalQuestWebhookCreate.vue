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
            <b-form-group label="Amount">
                <b-form-input type="number" v-model="amount" :min="0" />
            </b-form-group>
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
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { QuestVariant } from '@thxnetwork/common/enums';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';
import { mapGetters } from 'vuex';
import { TWebhookState } from '@thxnetwork/dashboard/store/modules/webhooks';

@Component({
    components: {
        BaseModalQuestCreate,
    },
    computed: mapGetters({
        webhooks: 'webhooks/all',
    }),
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
    expiryDate: Date | number | null = null;
    locks: TQuestLock[] = [];
    webhooks!: TWebhookState;
    webhook: TWebhook | null = null;
    webhookId = '';
    metadata = '';

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestWebhook;

    get webhookList() {
        if (!this.webhooks[this.pool._id]) return [];
        return Object.values(this.webhooks[this.pool._id]);
    }

    async onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
        this.webhookId = this.reward ? this.reward.webhookId : '';
        this.metadata = this.reward ? this.reward.metadata : this.metadata;

        await this.$store.dispatch('webhooks/list', this.pool);
        this.webhook = this.webhooks[this.pool._id][this.webhookId];
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
                expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                locks: JSON.stringify(this.locks),
                webhookId: this.webhook?._id,
                metadata: this.metadata,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit', { isPublished: this.isPublished });
                this.isLoading = false;
            });
    }
}
</script>
