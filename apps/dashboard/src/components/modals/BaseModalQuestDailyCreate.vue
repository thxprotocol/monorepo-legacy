<template>
    <BaseModalQuestCreate
        label="Daily Quest"
        @submit="onSubmit"
        @show="onShow"
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
                label="Amounts"
                tooltip="Configure a list of amounts that campaign participants can earn when completing the quest for consecutive days."
            >
                <b-form-group :key="key" v-for="(amount, key) of amounts">
                    <b-input-group :prepend="`Day ${key + 1}`">
                        <b-form-input v-model="amounts[key]" type="number" />
                        <b-input-group-append>
                            <b-button @click="$delete(amounts, key)" variant="gray">
                                <i class="fas fa-times ml-0"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <b-link @click="$set(amounts, amounts.length, 0)">Add amount</b-link>
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
                    </div>
                </b-collapse>
            </b-card>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { QuestVariant } from '@thxnetwork/common/enums';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseDropdownEventType from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownEventType.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
        BaseDropdownEventType,
    },
    computed: mapGetters({
        totals: 'dailyquests/totals',
    }),
})
export default class ModalquestDailyCreate extends Vue {
    isLoading = false;
    error = '';
    amounts = [5, 10, 20, 40, 80, 160, 360];
    eventName = '';
    isVisible = true;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestDaily;

    get code() {
        return `curl "${API_URL}/v1/webhook/daily/${this.quest ? this.quest.uuid : '<TOKEN>'}" \\
-X POST \\
-d "code=<CODE>"`;
    }

    get isSubmitDisabled() {
        return false;
    }

    onShow() {
        this.amounts = this.quest ? this.quest.amounts : this.amounts;
        this.eventName = this.quest ? this.quest.eventName : this.eventName;
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: QuestVariant.Daily,
                amounts: JSON.stringify(this.amounts),
                eventName: this.eventName,
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
