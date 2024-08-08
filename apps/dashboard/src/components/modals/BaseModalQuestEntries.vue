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
                :actions="actions"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <b-card variant="white" body-class="p-0 shadow-sm" class="mb-3">
                <b-table
                    id="table-entries"
                    hover
                    :busy="isLoading"
                    :items="entries"
                    responsive="xl"
                    show-empty
                    sort-by="isApproved"
                    :sort-desc="false"
                >
                    <!-- Head formatting -->
                    <template #head(checkbox)>
                        <b-form-checkbox :checked="isCheckedAll" @change="onChecked" />
                    </template>
                    <template #head(status)> Status </template>
                    <template #head(account)> Username </template>
                    <template #head(tokens)> Connected </template>
                    <template #head(amount)> Amount </template>
                    <template #head(metadata)> Metadata </template>
                    <template #head(created)> Created </template>
                    <template #head(entry)> &nbsp; </template>

                    <!-- Cell formatting -->
                    <template #cell(checkbox)="{ item }">
                        <b-form-checkbox :value="item.entry" v-model="selectedItems" />
                    </template>
                    <template #cell(status)="{ item }">
                        <BaseButtonQuestEntryStatus :quest="quest" :entry="item.entry" @update="getEntries" />
                    </template>
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
                        <div style="overflow-y: auto; height: 40px" class="bg-light px-2 rounded">
                            <code class="small">{{ item.metadata }}</code>
                        </div>
                    </template>
                    <template #cell(created)="{ item }">
                        <small class="text-muted">{{ format(new Date(item.created), 'dd-MM-yyyy HH:mm') }}</small>
                    </template>
                    <template #cell(entry)="{ item }">
                        <div v-if="item.entry"></div>
                    </template>
                </b-table>
            </b-card>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { getAddressURL } from '../../utils/chains';
import BaseParticipantAccount from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseButtonQuestEntryStatus from '@thxnetwork/dashboard/components/buttons/BaseButtonQuestEntryStatus.vue';
import BaseModal from './BaseModal.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';
import { TQuestEntryState } from '@thxnetwork/dashboard/store/modules/pools';
import { QuestEntryStatus } from '@thxnetwork/common/enums';

@Component({
    components: {
        BaseModal,
        BaseCardTableHeader,
        BaseParticipantAccount,
        BaseParticipantConnectedAccount,
        BaseButtonQuestEntryStatus,
    },
    computed: mapGetters({
        entriesList: 'pools/entries',
    }),
})
export default class BaseModalQuestEntries extends Vue {
    QuestEntryStatus = QuestEntryStatus;
    getAddressURL = getAddressURL;
    format = format;
    isCheckedAll = false;
    isLoading = false;
    selectedItems: TQuestEntry[] = [];
    entriesList!: TQuestEntryState;
    limit = 25;
    page = 1;
    actions = [
        // { label: 'Approve all', variant: 0 },
        // { label: 'Reject all', variant: 1 },
    ];

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
                checkbox: entry._id,
                status: entry.status,
                account: entry.account,
                tokens: entry.account && parseConnectedAccounts(entry.account),
                amount: entry.amount,
                metadata: entry.metadata,
                created: entry.createdAt,
                entry: entry as TQuestEntry,
            }));
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

    onClickUpdate(entry: TQuestEntry, status: QuestEntryStatus) {
        this.$store.dispatch('pools/updateEntries', {
            quest: this.quest,
            entries: [{ entryId: entry._id, status }],
        });
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? this.entriesList[this.quest.poolId][this.quest._id].results : [];
        this.isCheckedAll = checked;
    }

    async onClickAction(action: { variant: number }) {
        // 1. Publish, 2. Unpublish, 3. Delete
        const mappers = {
            0: () =>
                this.$store.dispatch('pools/updateEntries', {
                    quest: this.quest,
                    entries: this.selectedItems.map((entry) => ({
                        entryId: entry._id,
                        status: QuestEntryStatus.Approved,
                    })),
                }),
            1: () =>
                this.$store.dispatch('pools/updateEntries', {
                    quest: this.quest,
                    entries: this.selectedItems.map((entry) => ({
                        entryId: entry._id,
                        status: QuestEntryStatus.Rejected,
                    })),
                }),
        };
        await mappers[action.variant]();
        this.isCheckedAll = false;
        this.selectedItems = [];
        await this.getEntries();
    }
}
</script>

<style lang="scss">
#table-entries th:nth-child(1) {
    width: 40px;
}
#table-entries th:nth-child(2) {
    width: 40px;
}
#table-entries th:nth-child(3) {
    width: 40px;
}
#table-entries th:nth-child(4) {
    width: 40px;
}
#table-entries th:nth-child(5) {
    width: 40px;
}
#table-entries th:nth-child(6) {
    width: auto;
}
#table-entries th:nth-child(7) {
    width: 130px;
}
</style>
