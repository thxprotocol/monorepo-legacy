<template>
    <base-modal hide-footer size="xl" :title="`Quest Entries`" :id="id">
        <template #modal-body>
            <b-card>
                <b-row>
                    <b-col>
                        Entries: <strong>{{ questEntries.total }}</strong>
                    </b-col>
                    <b-col v-if="questEntries.meta && questEntries.meta.participantCount">
                        Participants: <strong>{{ questEntries.meta.participantCount }}</strong>
                    </b-col>
                    <b-col v-if="questEntries.meta && questEntries.meta.reachTotal">
                        Reached Users: <strong>{{ questEntries.meta.reachTotal }}</strong>
                    </b-col>
                </b-row>
            </b-card>
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :total-rows="questEntries.total"
                :selectedItems="selectedItems"
                :actions="[]"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <b-card variant="white" body-class="p-0 shadow-sm" class="mb-3">
                <b-table
                    hover
                    :busy="isLoading"
                    :items="entries"
                    responsive="xl"
                    show-empty
                    sort-by="isApproved"
                    :sort-desc="false"
                >
                    <!-- Head formatting -->
                    <template #head(account)> Username </template>
                    <template #head(tokens)> Connected </template>
                    <template #head(amount)> Amount </template>
                    <template #head(metadata)> Metadata </template>
                    <template #head(entry)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(account)="{ item }">
                        <BaseParticipantAccount :account="item.account" />
                    </template>
                    <template #cell(tokens)="{ item }">
                        <BaseParticipantConnectedAccount
                            :id="`entry${item.entry._id}`"
                            :account="a"
                            :key="key"
                            v-for="(a, key) in item.tokens"
                        />
                    </template>
                    <template #cell(amount)="{ item }">
                        <strong>{{ item.amount }}</strong>
                    </template>
                    <template #cell(metadata)="{ item }">
                        <code>{{ item.metadata }}</code>
                    </template>
                    <template #cell(entry)="{ item }">
                        <small class="text-muted">{{
                            format(new Date(item.entry.createdAt), 'dd-MM-yyyy HH:mm')
                        }}</small>
                    </template>
                </b-table>
            </b-card>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format, differenceInMilliseconds } from 'date-fns';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModal from './BaseModal.vue';
import { getAddressURL } from '../../utils/chains';
import BaseParticipantAccount from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';
import { TQuestEntryState } from '@thxnetwork/dashboard/store/modules/pools';

// Function to format the duration into a user-friendly string
function formatDuration(durationInMilliseconds) {
    const secondsInMillisecond = 1000;
    const minutesInMillisecond = secondsInMillisecond * 60;
    const hoursInMillisecond = minutesInMillisecond * 60;
    const daysInMillisecond = hoursInMillisecond * 24;

    if (durationInMilliseconds < secondsInMillisecond) {
        return `${durationInMilliseconds} milliseconds`;
    } else if (durationInMilliseconds < minutesInMillisecond) {
        const seconds = Math.floor(durationInMilliseconds / secondsInMillisecond);
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else if (durationInMilliseconds < hoursInMillisecond) {
        const minutes = Math.floor(durationInMilliseconds / minutesInMillisecond);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (durationInMilliseconds < daysInMillisecond) {
        const hours = Math.floor(durationInMilliseconds / hoursInMillisecond);
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        const days = Math.floor(durationInMilliseconds / daysInMillisecond);
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
}

@Component({
    components: {
        BaseModal,
        BaseCardTableHeader,
        BaseParticipantAccount,
        BaseParticipantConnectedAccount,
    },
    computed: mapGetters({
        entriesList: 'pools/entries',
    }),
})
export default class BaseModalQuestSocialEntries extends Vue {
    getAddressURL = getAddressURL;
    format = format;
    isLoading = false;
    selectedItems: string[] = [];
    entriesList!: TQuestEntryState;
    limit = 25;
    page = 1;

    @Prop() id!: string;
    @Prop() quest!: TQuestSocial;

    get questEntries(): {
        total: number;
        results: TQuestEntry[];
        meta?: { reachTotal?: number; participantCount?: number };
    } {
        if (!this.entriesList[this.quest.poolId]) return { total: 0, results: [] };
        if (!this.entriesList[this.quest.poolId][this.quest._id]) return { total: 0, results: [] };

        return this.entriesList[this.quest.poolId][this.quest._id];
    }

    get entries() {
        return this.questEntries.results
            .sort((a: TQuestEntry, b: TQuestEntry) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((entry: any) => ({
                account: entry.account,
                tokens: entry.account && parseConnectedAccounts(entry.account),
                amount: entry.amount,
                metadata: entry.metadata,
                entry,
            }));
    }

    getDuration(quest: TQuest, entry: TQuestEntry) {
        const startDate = new Date(quest.createdAt);
        const endDate = new Date(entry.createdAt);
        const durationInMilliseconds = differenceInMilliseconds(endDate, startDate);
        return formatDuration(durationInMilliseconds);
    }

    async getEntries() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listEntries', { quest: this.quest, page: this.page, limit: this.limit });
        this.isLoading = false;
    }

    onChangePage(page: number) {
        this.page = page;
        this.getEntries();
    }

    onChangeLimit(limit: number) {
        this.page = 1;
        this.limit = limit;
        this.getEntries();
    }
}
</script>
