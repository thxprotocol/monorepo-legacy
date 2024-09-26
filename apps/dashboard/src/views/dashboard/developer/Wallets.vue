<template>
    <b-form-row>
        <b-col md="4">
            <strong>Safe Multisig Wallets</strong>
            <div class="text-muted">
                These wallets can be used for reward distribution and fee payments. Transaction fees are relayed.
            </div>
        </b-col>
        <b-col md="8">
            <div class="d-flex justify-content-between align-items-center">
                <label> Wallets </label>
                <b-button variant="primary" size="sm" class="rounded-pill" v-b-modal="'modalWalletCreate'">
                    <i class="fas fa-plus ml-0 mr-2" />
                    Wallet
                </b-button>
                <BaseModalWalletCreate :pool="pool" id="modalWalletCreate" />
            </div>
            <hr />
            <BTable hover :items="wallets" show-empty responsive="lg" class="flex-grow-1">
                <!-- Head formatting -->
                <template #head(chainId)> Network </template>
                <template #head(address)> Address </template>
                <template #head(createdAt)> Created </template>
                <template #head(id)> &nbsp;</template>

                <!-- Cell formatting -->
                <template #cell(chainId)="{ item }">
                    <b-img
                        v-b-tooltip
                        :title="chainInfo[item.chainId].name"
                        :src="chainInfo[item.chainId].logo"
                        height="15"
                        width="15"
                    />
                </template>
                <template #cell(address)="{ item }">
                    <b-link :href="item.address.url" target="_blank">
                        {{ item.address.address.substring(0, 10) }}...
                        <i class="fas fa-external-link-alt ml-1 small" />
                    </b-link>
                </template>
                <template #cell(transactions)="{ item }">
                    <b-link v-b-modal="`modalWalletTransactions${item.wallet._id}`">
                        <i class="fas fa-exchange-alt mr-1 text-muted" />
                        {{ item.transactions }}
                    </b-link>
                </template>
                <template #cell(createdAt)="{ item }">
                    <span class="text-muted">
                        {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                    </span>
                </template>
                <template #cell(url)="{ item }">
                    <b-link :href="item.url" target="_blank" class="text-muted">
                        Safe UI
                        <i class="fas fa-external-link-alt ml-1" />
                    </b-link>
                </template>
                <template #cell(wallet)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret right>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="`modalDelete${item.wallet._id}`"> Remove </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalWalletTransactions
                        :pool="pool"
                        :wallet="item.wallet"
                        :id="`modalWalletTransactions${item.wallet._id}`"
                    />
                    <BaseModalDelete
                        :id="`modalDelete${item.wallet._id}`"
                        :loading="isLoading"
                        :error="error"
                        @submit="onDelete(item.wallet._id)"
                        :subject="`${item.address.address.substring(0, 10)}... on ${chainInfo[item.chainId].name}`"
                    />
                </template>
            </BTable>
        </b-col>
    </b-form-row>
</template>

<script lang="ts">
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';
import BaseModalWalletCreate from '@thxnetwork/dashboard/components/modals/BaseModalWalletCreate.vue';
import BaseModalWalletTransactions from '@thxnetwork/dashboard/components/modals/BaseModalWalletTransactions.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { format } from 'date-fns';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BaseModalDelete,
        BaseModalWalletCreate,
        BaseModalWalletTransactions,
    },
    computed: mapGetters({
        walletList: 'pools/wallets',
        poolList: 'pools/all',
    }),
})
export default class SettingsWallets extends Vue {
    error = '';
    isCopied = false;
    format = format;
    chainInfo = chainInfo;
    isLoading = false;
    walletList!: TWallet[];
    poolList!: IPools;

    get pool() {
        return this.poolList[this.$route.params.id];
    }

    get wallets() {
        if (!this.walletList) return [];
        return this.walletList.map((wallet: TWallet) => ({
            chainId: wallet.chainId,
            address: {
                address: wallet.address,
                url: `${chainInfo[wallet.chainId].safeURL}/transactions/history?safe=${wallet.address}`,
            },
            transactions: wallet.transactions.length,
            createdAt: wallet.createdAt,
            wallet,
        }));
    }

    mounted() {
        this.listWallets();
    }

    async listWallets() {
        await this.$store.dispatch('pools/listWallets', { pool: this.pool });
    }

    async onDelete(walletId) {
        this.isLoading = true;
        try {
            await this.$store.dispatch('pools/removeWallet', { pool: this.pool, walletId });
            await this.listWallets();
            this.$bvModal.hide(`modalDelete${walletId}`);
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
