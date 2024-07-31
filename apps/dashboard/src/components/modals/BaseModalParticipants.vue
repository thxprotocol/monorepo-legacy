<template>
    <BaseModal size="xl" title="Participants" :id="id" :hide-footer="true">
        <template #modal-body>
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :total-rows="rewardPayments.total"
                :selectedItems="selectedItems"
                :actions="[]"
                :hide-query="false"
                :query="query"
                @query="onInputQuery"
                @query-submit="onChangeQuery"
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
                    <template #head(pointBalance)> Point Balance </template>
                    <template #head(amount)> Amount </template>
                    <template #head(entry)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(account)="{ item }">
                        <BaseParticipantAccount :account="item.account" />
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
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { TRewardPaymentState } from '@thxnetwork/dashboard/store/modules/pools';
import { getAddressURL } from '../../utils/chains';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModal from './BaseModal.vue';
import BaseParticipantAccount from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';

@Component({
    components: {
        BaseModal,
        BaseCardTableHeader,
        BaseParticipantAccount,
    },
    computed: mapGetters({
        paymentsList: 'pools/rewardPayments',
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
    query = '';

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
                account: entry.account,
                pointBalance: entry.pointBalance,
                amount: entry.amount,
                entry,
            }));
    }

    mounted() {
        //
    }

    onChangeQuery() {
        this.page = 1;
        this.getPayments();
    }

    onInputQuery(query: string) {
        this.query = query;
    }

    async getPayments() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listRewardPayments', {
            reward: this.reward,
            page: this.page,
            limit: this.limit,
            query: this.query,
        });
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
