<template>
    <BaseModalQuestCreate
        variant="Daily Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        @change-date="expiryDate = $event"
        @change-locks="locks = $event"
        :info-links="infoLinks"
        :id="id"
        :error="error"
        :loading="isLoading"
        :published="isPublished"
        :disabled="isSubmitDisabled || !title"
        :quest="reward"
        :pool="pool"
    >
        <template #col-left>
            <b-form-group label="Amounts">
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
                    </div>
                </b-collapse>
            </b-card>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import type { TDailyReward, TInfoLink, TPool, TQuestLock } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { QuestVariant } from '@thxnetwork/common/lib/types';
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
        totals: 'dailyRewards/totals',
    }),
})
export default class ModalRewardDailyCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isPublished = false;
    error = '';
    title = '';
    amounts = [5, 10, 20, 40, 80, 160, 360];
    description = '';
    limit = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    isEnabledWebhookQualification = false;
    file: File | null = null;
    expiryDate: Date | number | null = null;
    eventName = '';
    isVisible = true;
    locks: TQuestLock[] = [];

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TDailyReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/daily/${this.reward ? this.reward.uuid : '<TOKEN>'}" \\
-X POST \\
-d "code=<CODE>"`;
    }

    onShow() {
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.amounts = this.reward ? this.reward.amounts : this.amounts;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.eventName = this.reward ? this.reward.eventName : this.eventName;
        this.locks = this.reward ? this.reward.locks : this.locks;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                variant: QuestVariant.Daily,
                _id: this.reward ? this.reward._id : undefined,
                poolId: this.pool._id,
                title: this.title,
                description: this.description,
                amounts: JSON.stringify(this.amounts),
                limit: this.limit,
                file: this.file,
                isPublished: this.isPublished,
                eventName: this.eventName,
                expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                page: this.reward ? this.reward.page : 1,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                index: this.reward ? this.reward.index : this.total,
                locks: JSON.stringify(this.locks),
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit');
                this.isLoading = false;
            });
    }
}
</script>
