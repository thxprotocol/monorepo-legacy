<template>
    <BaseModalQuestCreate
        label="Custom Quest"
        @show="onShow"
        @submit="onSubmit"
        :id="id"
        :pool="pool"
        :quest="quest"
        :disabled="isSubmitDisabled"
        :loading="isLoading"
        :error="error"
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
                            <BaseDropdownEventType @click="eventName = $event" :pool="pool" :event-name="eventName" />
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
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';
import BaseDropdownEventType from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownEventType.vue';

@Component({
    components: {
        BaseModalQuestCreate,
        BaseDropdownEventType,
    },
})
export default class ModalQuestCustomCreate extends Vue {
    isLoading = false;
    error = '';
    amount = 0;
    limit = 0;
    eventName = '';
    isCopied = false;
    isVisible = true;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestCustom;

    get isSubmitDisabled() {
        return false;
    }

    onShow() {
        this.amount = this.quest && this.quest.amount ? this.quest.amount : this.amount;
        this.limit = this.quest && this.quest.limit ? this.quest.limit : this.limit;
        this.eventName = this.quest ? this.quest.eventName : this.eventName;
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: QuestVariant.Custom,
                amount: this.amount,
                limit: this.limit,
                eventName: this.eventName,
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit', { isPublished: payload.isPublished });
            this.isLoading = false;
        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
