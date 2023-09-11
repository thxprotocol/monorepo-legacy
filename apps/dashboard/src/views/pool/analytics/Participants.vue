<template>
    <BCard class="mt-3">
        <BaseCardTableHeader
            :pool="pool"
            :page="page"
            :limit="limit"
            :total-rows="result.total"
            :selectedItems="[]"
            :actions="[]"
            :sorts="[
                {
                    value: '',
                    text: 'None',
                },
                {
                    value: 'email',
                    text: 'E-mail',
                },
                {
                    value: 'walletAddress',
                    text: 'Wallet',
                },
                { value: 'pointBalance', text: 'Point Balance' },
            ]"
            @change-sort="onChangeSort"
            @change-page="onChangePage"
            @change-limit="onChangeLimit"
        />
        <BTable id="table-participants" hover :busy="isLoading" :items="participantsByPage" responsive="lg" show-empty>
            <!-- Head formatting -->
            <template #head(account)> &nbsp;</template>
            <template #head(connectedAccounts)> Connected </template>
            <template #head(walletAddress)> Wallet </template>
            <template #head(pointBalance)> Point Balance </template>
            <template #head(createdAt)> Created </template>

            <!-- Cell formatting -->
            <template #cell(account)="{ item }"> <BaseParticipantAccount :account="item.account" /> </template>
            <template #cell(connectedAccounts)="{ item }">
                <BaseParticipantConnectedAccount :account="a" :key="key" v-for="(a, key) in item.connectedAccounts" />
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

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TPool } from '@thxnetwork/types/interfaces';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseParticipantAccount, { parseAccount } from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseParticipantWallet, { parseWallet } from '@thxnetwork/dashboard/components/BaseParticipantWallet.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';
import { format } from 'date-fns';

@Component({
    components: {
        BaseCardTableHeader,
        BaseParticipantAccount,
        BaseParticipantWallet,
        BaseParticipantConnectedAccount,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
        }),
    },
})
export default class ViewAnalyticsParticipants extends Vue {
    isLoading = false;
    format = format;
    sort = '';
    page = 1;
    limit = 10;
    result = {
        results: [],
        total: 1,
    };

    @Prop() pool!: TPool;

    get participantsByPage() {
        return Object.values(this.result.results).map((p: any) => ({
            account: parseAccount({ id: p._id, account: p.account }),
            connectedAccounts: parseConnectedAccounts(p.account.connectedAccounts),
            wallet: parseWallet(p.wallet),
            pointBalance: p.pointBalance,
            createdAt: p.createdAt,
        }));
    }

    mounted() {
        this.getParticipants();
    }

    async getParticipants() {
        this.isLoading = true;
        this.result = await this.$store.dispatch('pools/participants', {
            pool: this.pool,
            page: this.page,
            limit: this.limit,
            sort: this.sort,
        });
        this.isLoading = false;
    }

    onChangePage(page: number) {
        this.page = page;
        this.getParticipants();
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.getParticipants();
    }
    onChangeSort(sort: string) {
        this.sort = sort;
        this.getParticipants();
    }
}
</script>
