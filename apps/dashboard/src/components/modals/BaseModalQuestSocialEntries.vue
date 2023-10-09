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
import type { TPointReward, TPointRewardClaim, TPool, TQuestEntry } from '@thxnetwork/types/interfaces';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModal from './BaseModal.vue';
import { getAddressURL } from '../../utils/chains';
import { platformList } from '@thxnetwork/dashboard/types/rewards';
import BaseParticipantAccount, { parseAccount } from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseParticipantWallet, { parseWallet } from '@thxnetwork/dashboard/components/BaseParticipantWallet.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';

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
            .sort((a: TPointRewardClaim, b: TPointRewardClaim) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((entry: any) => ({
                account: parseAccount({ id: entry._id, account: entry.account }),
                connectedAccounts: entry.account && parseConnectedAccounts(entry.account.connectedAccounts),
                wallet: parseWallet(entry.wallet),
                pointBalance: entry.pointBalance,
                createdAt: entry.createdAt,
            }));
    }

    onShow() {
        // debugger;
    }
}
</script>
