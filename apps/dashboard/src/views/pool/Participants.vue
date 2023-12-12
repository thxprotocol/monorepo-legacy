<template>
    <div>
        <h2 class="mb-3">Participants: {{ result.total }}</h2>
        <BCard class="shadow-sm mb-5" no-body v-if="pool">
            <BaseCardTableHeader
                :pool="pool"
                :page="page"
                :limit="limit"
                :total-rows="result.total"
                :selectedItems="[]"
                :actions="[]"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BTable
                id="table-participants"
                hover
                :busy="isLoading"
                :items="participantsByPage"
                responsive="lg"
                show-empty
            >
                <!-- Head formatting -->
                <template #head(rank)>
                    <BaseBtnSort @click="onClickSort('rank', $event)">Rank</BaseBtnSort>
                </template>
                <template #head(account)>
                    <BaseBtnSort @click="onClickSort('username', $event)">Username</BaseBtnSort>
                </template>
                <template #head(email)>
                    <BaseBtnSort @click="onClickSort('email', $event)">E-mail</BaseBtnSort>
                </template>
                <template #head(connectedAccounts)> Connected </template>
                <template #head(wallet)>
                    <BaseBtnSort @click="onClickSort('wallet', $event)">Wallet</BaseBtnSort>
                </template>
                <template #head(pointBalance)>
                    <BaseBtnSort @click="onClickSort('pointBalance', $event)">Point Balance</BaseBtnSort>
                </template>
                <template #head(subscription)>
                    <BaseBtnSort @click="onClickSort('subscription', $event)">Subscribed</BaseBtnSort>
                </template>
                <template #head(createdAt)>
                    <BaseBtnSort @click="onClickSort('createdAt', $event)">Created</BaseBtnSort>
                </template>
                <template #head(participant)> &nbsp;</template>

                <!-- Cell formatting -->
                <template #cell(rank)="{ item }">
                    <span>{{ item.rank }}</span>
                </template>
                <template #cell(account)="{ item }"> <BaseParticipantAccount :account="item.account" /> </template>
                <template #cell(email)="{ item }"> {{ item.email }} </template>
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
                <template #cell(subscription)="{ item }">
                    <small class="text-muted">
                        {{ item.subscription ? format(new Date(item.subscription.createdAt), 'dd-MM-yyyy HH:mm') : '' }}
                    </small>
                </template>
                <template #cell(createdAt)="{ item }">
                    <small class="text-muted">{{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}</small>
                </template>
                <template #cell(participant)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item
                            disabled
                            v-b-modal="'modalSendPoints' + item.participant._id"
                            link-class="d-flex align-items-center justify-content-between"
                        >
                            Point Balance
                            <i class="fas fa-caret-right ml-3" />
                        </b-dropdown-item>
                        <b-dropdown-item
                            disabled
                            v-b-modal="'modalSendMessage' + item.participant._id"
                            link-class="d-flex align-items-center justify-content-between"
                        >
                            Notification
                            <i class="fas fa-caret-right ml-3" />
                        </b-dropdown-item>
                    </b-dropdown>
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseBtnSort from '@thxnetwork/dashboard/components/buttons/BaseBtnSort.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseParticipantAccount, { parseAccount } from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';
import BaseParticipantWallet, { parseWallet } from '@thxnetwork/dashboard/components/BaseParticipantWallet.vue';
import BaseParticipantConnectedAccount, {
    parseConnectedAccounts,
} from '@thxnetwork/dashboard/components/BaseParticipantConnectedAccount.vue';
import { format } from 'date-fns';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {
        BaseBtnSort,
        BaseCardTableHeader,
        BaseParticipantAccount,
        BaseParticipantWallet,
        BaseParticipantConnectedAccount,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class ViewParticipants extends Vue {
    pools!: IPools;
    isLoading = false;
    format = format;
    page = 1;
    limit = 10;
    sorts = {
        rank: (a, b) => {
            const rankA = a.rank ? a.rank : 0;
            const rankB = b.rank ? b.rank : 0;
            if (rankA < rankB) return 1;
            if (rankA > rankB) return -1;
            return 0;
        },
        username: (a, b) => {
            const usernameA = a.account && a.account.username ? a.account.username.toLowerCase() : '';
            const usernameB = b.account && b.account.username ? b.account.username.toLowerCase() : '';
            if (usernameA < usernameB) return -1;
            if (usernameA > usernameB) return 1;
            return 0;
        },
        email: (a, b) => {
            const emailA = a.account && a.account.email ? a.account.email.toLowerCase() : '';
            const emailB = b.account && b.account.email ? b.account.email.toLowerCase() : '';
            if (emailA < emailB) return -1;
            if (emailA > emailB) return 1;
            return 0;
        },
        wallet: (a, b) => {
            const addressA = a.wallet && a.wallet.address.toLowerCase();
            const addressB = b.wallet && b.wallet.address.toLowerCase();
            if (addressA < addressB) return -1;
            if (addressA > addressB) return 1;
            return 0;
        },
        pointBalance: (a, b) => b.pointBalance - a.pointBalance,
        subscription: (a, b) => {
            const dateA: any = a.subscription && new Date(a.subscription.createdAt);
            const dateB: any = b.subscription && new Date(b.subscription.createdAt);
            return dateB - dateA;
        },
        createdAt: (a, b) => {
            const dateA: any = new Date(a.createdAt);
            const dateB: any = new Date(b.createdAt);
            return dateB - dateA;
        },
    };
    result = {
        results: [],
        total: 0,
    };

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get participantsByPage() {
        return Object.values(this.result.results).map((p: any) => ({
            rank: p.rank,
            account: parseAccount({ id: p._id, account: p.account }),
            email: p.account && p.account.email,
            connectedAccounts: p.account && parseConnectedAccounts(p.account.connectedAccounts),
            wallet: parseWallet(p.wallet),
            pointBalance: p.pointBalance,
            subscription: p.subscription,
            createdAt: p.createdAt,
            participant: p,
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
        });
        this.isLoading = false;
    }

    onClickSort(variant: string, direction: string) {
        this.result.results.sort((a, b) => {
            if (direction === 'asc') {
                return this.sorts[variant](a, b);
            } else if (direction === 'desc') {
                return this.sorts[variant](b, a);
            }
        });
    }

    onChangePage(page: number) {
        this.page = page;
        this.getParticipants();
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.getParticipants();
    }
}
</script>
