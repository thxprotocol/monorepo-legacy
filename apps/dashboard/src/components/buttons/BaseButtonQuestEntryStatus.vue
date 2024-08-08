<template>
    <b-button-group size="sm">
        <b-button
            variant="link"
            class="text-muted"
            @click="onClickUpdate(entry, QuestEntryStatus.Approved)"
            :disabled="isApproved"
        >
            <b-spinner v-if="isLoadingApprove" small />
            <template v-else> <i class="fas fa-thumbs-up m-0" :class="{ 'text-success': isApproved }" /> </template>
        </b-button>
        <b-button
            variant="link"
            class="text-muted"
            @click="onClickUpdate(entry, QuestEntryStatus.Rejected)"
            :disabled="isRejected"
        >
            <b-spinner v-if="isLoadingReject" small />
            <template v-else> <i class="fas fa-thumbs-down m-0" :class="{ 'text-danger': isRejected }" /></template>
        </b-button>
    </b-button-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestEntryStatus } from '@thxnetwork/common/enums';

@Component({})
export default class BaseButtonQuestEntryStatus extends Vue {
    isLoadingApprove = false;
    isLoadingReject = false;
    QuestEntryStatus = QuestEntryStatus;

    @Prop() quest!: TQuest;
    @Prop() entry!: TQuestEntry;

    get isApproved() {
        return this.entry.status === QuestEntryStatus.Approved;
    }

    get isRejected() {
        return this.entry.status === QuestEntryStatus.Rejected;
    }

    async onClickUpdate(entry: TQuestEntry, status: QuestEntryStatus) {
        const key = status === QuestEntryStatus.Approved ? 'isLoadingApprove' : 'isLoadingReject';
        this[key] = true;
        try {
            await this.$store.dispatch('pools/updateEntries', {
                quest: this.quest,
                entries: [{ entryId: entry._id, status }],
            });
        } catch (error: any) {
            throw error;
        } finally {
            this.$emit('update');
            this[key] = false;
        }
    }
}
</script>
