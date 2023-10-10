<template>
    <base-modal
        hide-footer
        size="xl"
        :title="`Quest Entries: ${entriesByPage.length} `"
        :id="id"
        @show="onShow"
        v-if="pool"
    >
        <template #modal-body>
            <BCard variant="white" body-class="p-0 shadow-sm" class="mb-3">
                <BTable hover :items="entriesByPage" responsive="lg" show-empty sort-by="isApproved" :sort-desc="false">
                    <!-- Head formatting -->
                    <template #head(account)> &nbsp;</template>
                    <template #head(connectedAccounts)> Connected </template>
                    <template #head(walletAddress)> Wallet </template>
                    <template #head(pointBalance)> Point Balance </template>
                    <template #head(duration)> Duration </template>
                    <template #head(createdAt)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(account)="{ item }">
                        <BaseParticipantAccount :account="item.account" />
                    </template>
                    <template #cell(connectedAccounts)="{ item }">
                        <BaseParticipantConnectedAccount
                            :account="a"
                            :key="key"
                            v-for="(a, key) in item.connectedAccounts"
                        />
                    </template>
                    <template #cell(wallet)="{ item }">
                        <BaseParticipantWallet :wallet="item.wallet" />
                    </template>
                    <template #cell(pointBalance)="{ item }">
                        <strong class="text-primary">{{ item.pointBalance }}</strong>
                    </template>
                    <template #cell(duration)="{ item }">
                        <code>{{ item.duration }}</code>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">{{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}</small>
                    </template>
                </BTable>
            </BCard>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TPointReward, TPool, TQuest, TQuestEntry } from '@thxnetwork/types/interfaces';
import { mapGetters } from 'vuex';
import { format, differenceInMilliseconds } from 'date-fns';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModal from './BaseModal.vue';
import { getAddressURL } from '../../utils/chains';
import { platformList } from '@thxnetwork/dashboard/types/rewards';
import BaseParticipantAccount, { parseAccount } from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseParticipantWallet, { parseWallet } from '@thxnetwork/dashboard/components/BaseParticipantWallet.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';

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
        BaseParticipantWallet,
        BaseParticipantConnectedAccount,
    },
    computed: mapGetters({
        totals: 'referralRewardClaims/totals',
        referralRewardClaims: 'referralRewardClaims/all',
    }),
})
export default class BaseModalQuestSocialEntries extends Vue {
    getAddressURL = getAddressURL;
    platformList = platformList;
    format = format;
    isLoading = true;
    limit = 5;
    page = 1;
    selectedItems: string[] = [];

    totals!: { [poolId: string]: number };

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop() quest!: TPointReward;
    @Prop() entries!: TQuestEntry[];

    get total() {
        return this.totals[this.pool._id];
    }

    get entriesByPage() {
        if (!this.entries) return [];
        return this.entries
            .sort((a: TQuestEntry, b: TQuestEntry) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((entry: any) => ({
                account: parseAccount({ id: entry._id, account: entry.account }),
                connectedAccounts: entry.account && parseConnectedAccounts(entry.account.connectedAccounts),
                wallet: parseWallet(entry.wallet),
                pointBalance: entry.pointBalance,
                duration: this.getDuration(this.quest, entry),
                createdAt: entry.createdAt,
            }));
    }

    getDuration(quest: TQuest, entry: TQuestEntry) {
        const startDate = new Date(quest.createdAt);
        const endDate = new Date(entry.createdAt);
        const durationInMilliseconds = differenceInMilliseconds(endDate, startDate);
        return formatDuration(durationInMilliseconds);
    }

    onShow() {
        // debugger;
    }
}
</script>
