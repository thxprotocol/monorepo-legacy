<template>
    <base-modal hide-footer size="xl" :title="`Quest Entries`" :id="id">
        <template #modal-body>
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :total-rows="rewardPayments.total"
                :selectedItems="selectedItems"
                :actions="[]"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <b-card variant="white" body-class="p-0 shadow-sm" class="mb-3">
                <b-table
                    hover
                    :busy="isLoading"
                    :items="payments"
                    responsive="xl"
                    show-empty
                    sort-by="isApproved"
                    :sort-desc="false"
                >
                    <!-- Head formatting -->
                    <template #head(account)> Username </template>
                    <template #head(email)> E-mail</template>
                    <template #head(tokens)> Connected </template>
                    <template #head(pointBalance)> Point Balance </template>
                    <template #head(amount)> Amount </template>
                    <template #head(entry)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(account)="{ item }">
                        <BaseParticipantAccount :account="item.account" />
                    </template>
                    <template #cell(email)="{ item }">
                        {{ item.email }}
                    </template>
                    <template #cell(tokens)="{ item }">
                        <BaseParticipantConnectedAccount
                            :id="`entry${item.entry._id}`"
                            :account="a"
                            :key="key"
                            v-for="(a, key) in item.tokens"
                        />
                    </template>
                    <template #cell(pointBalance)="{ item }">
                        <strong class="text-primary">{{ item.pointBalance }}</strong>
                    </template>
                    <template #cell(amount)="{ item }">
                        <strong>{{ item.amount }}</strong>
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
import { format } from 'date-fns';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModal from './BaseModal.vue';
import { getAddressURL } from '../../utils/chains';
import BaseParticipantAccount, { parseAccount } from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';
import { TRewardPaymentState } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {
        BaseModal,
        BaseCardTableHeader,
        BaseParticipantAccount,
        BaseParticipantConnectedAccount,
    },
    computed: mapGetters({
        paymentsList: 'pools/payments',
    }),
})
export default class BaseModalParticipants extends Vue {
    getAddressURL = getAddressURL;
    format = format;
    isLoading = false;
    selectedItems: string[] = [];
    paymentsList!: TRewardPaymentState;
    limit = 25;
    page = 1;

    @Prop() id!: string;
    @Prop() reward!: TReward;

    get rewardPayments(): {
        total: number;
        results: TRewardPayment[];
        meta?: { reachTotal?: number; participantCount?: number };
    } {
        if (!this.paymentsList[this.reward.poolId]) return { total: 0, results: [] };
        if (!this.paymentsList[this.reward.poolId][this.reward._id]) return { total: 0, results: [] };

        return this.paymentsList[this.reward.poolId][this.reward._id];
    }

    get payments() {
        return this.rewardPayments.results
            .sort((a: TRewardPayment, b: TRewardPayment) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((entry: any) => ({
                account: parseAccount({ id: entry._id, account: entry.account }),
                email: entry.account && entry.account.email,
                tokens: entry.account && parseConnectedAccounts(entry.account),
                pointBalance: entry.pointBalance,
                amount: entry.amount,
                entry,
            }));
    }

    mounted() {
        console.log();
        debugger;
    }

    async getPayments() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listPayments', { reward: this.reward, page: this.page, limit: this.limit });
        this.isLoading = false;
    }

    onChangePage(page: number) {
        this.page = page;
        this.getPayments();
    }

    onChangeLimit(limit: number) {
        this.page = 1;
        this.limit = limit;
        this.getPayments();
    }
}
</script>
