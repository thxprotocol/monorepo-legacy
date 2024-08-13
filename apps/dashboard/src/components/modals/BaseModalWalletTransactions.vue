<template>
    <BaseModal :error="error" hide-footer title="Transaction Queue" :id="id" @show="onShow">
        <template #modal-body>
            <b-alert show variant="primary">
                <i class="fas fa-info-circle mr-1" />
                This is an overview of the 50 last transactions for your Safe multisig
            </b-alert>
            <div class="table-responsive">
                <b-table show-empty hover :items="transactions">
                    <template #cell(created)="{ item }">
                        <span v-b-tooltip :title="`Updated: ${item.created.updated}`" class="text-muted">
                            {{ item.created.created }}
                        </span>
                    </template>
                    <template #cell(safeTxHash)="{ item }">
                        {{ item.safeTxHash.label }}...
                        <b-link v-if="item.safeTxHash.url" :href="item.safeTxHash.url" target="_blank">
                            <i class="fas fa-external-link-alt ml-1" />
                        </b-link>
                    </template>
                    <template #cell(transactionHash)="{ item }">
                        {{ item.transactionHash.label }}...
                        <b-link :href="item.transactionHash.url" target="_blank">
                            <i class="fas fa-external-link-alt ml-1" />
                        </b-link>
                    </template>
                    <template #head(state)="{}">
                        State
                        <i
                            class="fas fa-info-circle ml-1 text-muted"
                            v-b-tooltip
                            title="Queued, Confirmed, Sent, Mined, Failed"
                        />
                    </template>
                    <template #cell(state)="{ item }">
                        <b-badge :variant="item.state.variant" class="p-2">{{ item.state.label }}</b-badge>
                    </template>
                    <template #head(tx)="{}"> &nbsp; </template>
                    <template #cell(tx)="{ item }">
                        <b-dropdown size="sm" variant="link" no-caret>
                            <template #button-content>
                                <i class="fas fa-ellipsis-h ml-0 text-muted" />
                            </template>
                            <b-dropdown-item
                                :disabled="item.tx.state !== TransactionState.Failed"
                                @click="onClickRetry(item.tx)"
                            >
                                Retry
                            </b-dropdown-item>
                            <b-dropdown-item @click="onClickDelete(item.tx)">Delete</b-dropdown-item>
                        </b-dropdown>
                    </template>
                </b-table>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TransactionState } from '@thxnetwork/common/enums';
import { format } from 'date-fns';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';

const stateVariantMap = {
    [TransactionState.Queued]: 'light',
    [TransactionState.Confirmed]: 'light',
    [TransactionState.Sent]: 'light',
    [TransactionState.Mined]: 'light',
    [TransactionState.Failed]: 'danger',
};

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalWalletTransactions extends Vue {
    isLoading = false;
    error = '';
    TransactionState = TransactionState;
    format = format;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop() wallet!: TWallet;

    get transactions() {
        return this.wallet.transactions.map((tx) => ({
            created: {
                created: format(new Date(tx.createdAt), 'dd-MM-yyyy HH:mm:ss'),
                updated: format(new Date(tx.updatedAt), 'dd-MM-yyyy HH:mm:ss'),
            },
            safeTxHash: {
                label: tx.safeTxHash ? tx.safeTxHash.substring(0, 10) : 'Pending',
                url:
                    tx.safeTxHash &&
                    `${chainInfo[this.wallet.chainId].safeURL}/transactions/history?safe=${this.wallet.address}`,
            },
            transactionHash: {
                label: tx.transactionHash ? tx.transactionHash.substring(0, 10) : 'Pending',
                url: tx.transactionHash && `${chainInfo[this.wallet.chainId].blockExplorer}/tx/${tx.transactionHash}`,
            },
            state: {
                label: TransactionState[tx.state],
                variant: stateVariantMap[tx.state],
            },
            tx,
        }));
    }

    onShow() {
        this.getWallet();
    }

    async getWallet() {
        await this.$store.dispatch('pools/getWallet', { pool: this.pool, wallet: this.wallet });
    }

    async onClickRefresh() {
        try {
            this.isLoading = true;
            await this.getWallet();
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    async onClickRetry(tx: TTransaction) {
        try {
            this.isLoading = true;
            await this.$store.dispatch('pools/updateTransaction', {
                pool: this.pool,
                wallet: this.wallet,
                tx: { ...tx, state: TransactionState.Confirmed },
            });
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    async onClickDelete(tx: TTransaction) {
        try {
            this.isLoading = true;
            await this.$store.dispatch('pools/removeTransaction', { pool: this.pool, wallet: this.wallet, tx });
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
