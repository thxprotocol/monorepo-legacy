<template>
    <div>
        <b-form-row v-if="error">
            <b-col md="4"></b-col>
            <b-col md="8">
                <b-alert variant="danger" show>
                    {{ error }}
                </b-alert>
            </b-col>
        </b-form-row>
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
                    <template #head(chainId)> Chain </template>
                    <template #head(address)> Address </template>
                    <template #head(createdAt)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(chainId)="{ item }">
                        <span>{{ item.chainId }}</span>
                    </template>
                    <template #cell(address)="{ item }">
                        <code>{{ item.address }}</code>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">
                            {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </template>
                    <template #cell(url)="{ item }">
                        <b-link :href="item.url" target="_blank" class="text-muted">
                            Safe UI
                            <i class="fas fa-external-link-alt ml-1" />
                        </b-link>
                    </template>
                    <template #cell(id)="{ item }">
                        <b-dropdown variant="link" size="sm" no-caret>
                            <template #button-content>
                                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                            </template>
                            <b-dropdown-item v-b-modal="`modalDelete${item.id}`"> Remove </b-dropdown-item>
                        </b-dropdown>
                        <BaseModalDelete
                            :id="`modalDelete${item.id.id}`"
                            :error="error"
                            @submit="onDelete"
                            :subject="item.address"
                        />
                    </template>
                </BTable>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ChainId } from '@thxnetwork/common/enums';
import { format } from 'date-fns';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';
import BaseModalWalletCreate from '@thxnetwork/dashboard/components/modals/BaseModalWalletCreate.vue';

const safeURLMap = {
    [ChainId.Linea]: 'https://safe.linea.build',
    [ChainId.Polygon]: 'https://app.safe.global',
};

@Component({
    components: {
        BaseModalDelete,
        BaseModalWalletCreate,
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

    walletList!: TWallet[];
    poolList!: IPools;

    get pool() {
        return this.poolList[this.$route.params.id];
    }

    get wallets() {
        if (!this.walletList[this.pool._id]) return [];
        return this.walletList[this.pool._id].map((wallet: TWallet) => ({
            chainId: wallet.chainId,
            address: wallet.address,
            createdAt: wallet.createdAt,
            id: {
                id: wallet._id,
                url: `${safeURLMap[wallet.chainId]}/transactions/history?safe=${wallet.address}`,
            },
        }));
    }

    mounted() {
        this.$store.dispatch('pools/listWallets', { pool: this.pool });
    }

    onDelete() {
        debugger;
    }
}
</script>
