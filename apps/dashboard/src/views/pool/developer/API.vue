<template>
    <b-form-row>
        <b-col md="4">
            <strong>API Keys</strong>
            <p class="text-muted">...</p>
        </b-col>
        <b-col md="8">
            <b-button variant="primary" v-b-modal="'modalClientCreate'" class="rounded-pill">
                <i class="fas fa-plus mr-2"></i>
                API Key
            </b-button>
            <BTable hover :busy="isLoading" :items="clientsByPage" :fields="fields" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox :disabled="shouldDisableActions" @change="onChecked" />
                </template>
                <template #head(name)> Client Name </template>
                <template #head(type)> Grant Type </template>
                <template #head(info)> &nbsp; </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :disabled="shouldDisableActions" :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(name)="{ item }">
                    {{ item.name }}
                </template>
                <template #cell(type)="{ item }">
                    {{ item.grantType }}
                </template>
                <template #cell(info)="{ item }">
                    <b-form-row>
                        <b-col md="3">
                            <label class="text-gray">Client ID</label>
                        </b-col>
                        <b-col>
                            <b-input-group size="sm" class="mb-2">
                                <b-form-input readonly size="sm" :value="item.clientId" />
                                <template #append>
                                    <b-button size="sm" variant="dark" v-clipboard:copy="item.clientId">
                                        <i class="fas fa-clipboard m-0"></i>
                                    </b-button>
                                </template>
                            </b-input-group>
                        </b-col>
                    </b-form-row>
                    <b-form-row>
                        <b-col md="3">
                            <label class="text-gray">Client Secret</label>
                        </b-col>
                        <b-col>
                            <b-input-group size="sm">
                                <b-form-input readonly size="sm" :value="secretEncode(item.clientSecret)" />

                                <template #append>
                                    <b-button size="sm" variant="dark" v-clipboard:copy="item.clientSecret">
                                        <i class="fas fa-clipboard m-0"></i>
                                    </b-button>
                                </template>
                            </b-input-group>
                        </b-col>
                    </b-form-row>
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item @click="onEdit(item)">Edit</b-dropdown-item>
                    </b-dropdown>
                </template>
            </BTable>
            <base-modal-client-create
                @hidden="onClose"
                :client="editingClient"
                :pool="pool"
                :page="page"
                @submit="onSubmit"
            />
        </b-col>
    </b-form-row>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { TClient } from '@thxnetwork/dashboard/store/modules/clients';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseListItemClient from '@thxnetwork/dashboard/components/list-items/BaseListItemClient.vue';
import BaseModalClientCreate from '@thxnetwork/dashboard/components/modals/BaseModalClientCreate.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import { AccountPlanType } from '@thxnetwork/types/enums';
import { TAccount } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseListItemClient,
        BaseModalClientCreate,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        totals: 'clients/totals',
        clients: 'clients/all',
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class Clients extends Vue {
    page = 1;
    limit = 5;
    isLoading = true;

    fields = ['checkbox', 'name', 'type', 'info', 'id'];
    actions = [];

    shouldDisableActions = !this.actions.length;

    totals!: { [poolId: string]: number };
    clients!: { [poolId: string]: { [id: string]: TClient } };
    editingClient: TClient | null = null;
    pools!: IPools;
    account!: TAccount;

    selectedItems: string[] = [];

    get total() {
        return this.totals[this.$route.params.id];
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get clientsByPage() {
        if (!this.clients[this.$route.params.id]) return [];
        return Object.values(this.clients[this.$route.params.id])
            .filter((client: TClient) => client.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TClient) => ({
                id: r._id,
                checkbox: r._id,
                ...r,
            }))
            .slice(0, this.limit);
    }

    mounted() {
        this.listClients();
    }

    onChangePage(page: number) {
        this.page = page;
        this.listClients();
    }

    onSubmit() {
        this.page = 1;
        this.listClients();
        this.onClose();
    }

    onClose() {
        this.editingClient = null;
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? (this.clientsByPage.map((r) => r.id) as string[]) : [];
    }

    secretEncode(secret = '') {
        return Array.from({ length: secret.length })
            .map(() => '•')
            .join('');
    }

    onEdit(client: TClient) {
        this.editingClient = client;
        this.$bvModal.show('modalClientCreate');
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listClients();
    }

    onClickAction() {
        /** Not yet implemented bulk actions */
    }

    async listClients() {
        if (!this.account || this.account.plan !== AccountPlanType.Premium) return;
        this.isLoading = true;
        await this.$store.dispatch('clients/list', {
            page: this.page,
            limit: this.limit,
            pool: this.pool,
        });
        this.isLoading = false;
    }
}
</script>
