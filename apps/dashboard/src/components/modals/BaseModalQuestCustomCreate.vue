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
        @change-locks="locks = $event"
        :pool="pool"
        :published="isPublished"
        :id="id"
        :error="error"
        :info-links="infoLinks"
        :loading="isLoading"
        :disabled="isSubmitDisabled || !title"
        :quest="reward"
    >
        <template #col-left>
            <BaseFormGroup
                required
                label="Amount"
                tooltip="The amount of points the campaign participant will earn for completing this quest."
            >
                <b-form-input type="number" v-model="amount" />
            </BaseFormGroup>
        </template>
        <template #col-right>
            <b-card class="mb-3" body-class="bg-light p-0">
                <b-button
                    class="d-flex align-items-center justify-content-between w-100"
                    variant="light"
                    v-b-toggle.collapse-card-events
                >
                    <strong>Events</strong>
                    <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
                </b-button>
                <b-collapse id="collapse-card-events" v-model="isVisible">
                    <hr class="mt-0" />
                    <div class="px-3">
                        <BaseFormGroup
                            required
                            label="Event Type"
                            tooltip="Requires this event for a participant to complete the quest."
                        >
                            <BaseDropdownEventType
                                @click="eventName = $event"
                                :events="pool.events"
                                :event-name="eventName"
                            />
                            <template #description>
                                Use our
                                <b-link href="https://docs.thx.network/developers/js-sdk">JavaScript SDK</b-link> or
                                <b-link href="https://docs.thx.network/developers/api">REST API</b-link> to register
                                your events for user identities.
                            </template>
                        </BaseFormGroup>
                        <BaseFormGroup label="Limit" tooltip="Maximum amount of claims for this event per account.">
                            <b-form-input type="number" v-model="limit" min="0" />
                        </BaseFormGroup>
                    </div>
                </b-collapse>
            </b-card>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestVariant } from '@thxnetwork/common/enums';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';
import BaseDropdownEventType from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownEventType.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
        BaseDropdownEventType,
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
    eventName = '';
    file: File | null = null;
    locks: TQuestLock[] = [];

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestCustom;

    onShow() {
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.limit = this.reward && this.reward.limit ? this.reward.limit : this.limit;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.eventName = this.reward ? this.reward.eventName : this.eventName;
        this.locks = this.reward ? this.reward.locks : this.locks;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                _id: this.reward ? this.reward._id : undefined,
                variant: QuestVariant.Custom,
                page: 1,
                poolId: String(this.pool._id),
                title: this.title,
                description: this.description,
                isPublished: this.isPublished,
                file: this.file,
                amount: this.amount,
                limit: this.limit,
                expiryDate: this.expiryDate,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                index: !this.reward ? this.total : this.reward.index,
                eventName: this.eventName,
                locks: this.locks,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit', { isPublished: this.isPublished });
                this.isLoading = false;
            });
    }
}
</script>
