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
                        <b-form-group
                            label="Event Type"
                            description="Requires this event for a participant to complete the quest."
                        >
                            <BaseDropdownEventType
                                @click="eventName = $event"
                                :events="pool.events"
                                :event-name="eventName"
                            />
                        </b-form-group>
                        <b-form-group label="Limit" description="Maximum amount of claims for this event per account.">
                            <b-form-input type="number" v-model="limit" min="0" />
                        </b-form-group>
                    </div>
                </b-collapse>
            </b-card>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { TInfoLink, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TMilestoneReward } from '@thxnetwork/types/index';
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

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TMilestoneReward;

    onShow() {
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.limit = this.reward && this.reward.limit ? this.reward.limit : this.limit;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.eventName = this.reward ? this.reward.eventName : this.eventName;
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
                eventName: this.eventName,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit');
                this.isLoading = false;
            });
    }
}
</script>
