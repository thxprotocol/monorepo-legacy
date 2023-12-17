<template>
    <b-form-row>
        <b-col md="4">
            <strong>API Keys</strong>
            <p class="text-muted">Register OAuth2 clients and build your own frontend against THX API's.</p>
            <BaseCode :code="code" language="js" />
        </b-col>
        <b-col md="8">
            <b-form-group>
                <template #label>
                    Clients
                    <b-button
                        size="sm"
                        variant="primary"
                        v-b-modal="'modalClientCreate'"
                        class="rounded-pill float-right"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        API Key
                    </b-button>
                    <BaseModalClientCreate :pool="pool" @submit="onSubmit" />
                </template>
                <BTable hover :busy="isLoading" :items="clientsByPage" responsive="lg" show-empty>
                    <!-- Head formatting -->
                    <template #head(name)> Client Name </template>
                    <template #head(grantType)> Grant Type </template>
                    <template #head(info)> &nbsp; </template>
                    <template #head(id)> &nbsp; </template>

                    <!-- Cell formatting -->
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
                                    <b-form-input readonly size="sm" :value="item.info.clientId" />
                                    <template #append>
                                        <b-button size="sm" variant="dark" v-clipboard:copy="item.info.clientId">
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
                                    <b-form-input readonly size="sm" :value="item.info.clientSecret" />

                                    <template #append>
                                        <b-button size="sm" variant="dark" v-clipboard:copy="item.info.clientSecret">
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
                            <b-dropdown-item v-b-modal="`modalClientCreate${item.id}`">Edit</b-dropdown-item>
                        </b-dropdown>
                    </template>
                </BTable>
            </b-form-group>
        </b-col>
    </b-form-row>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseListItemClient from '@thxnetwork/dashboard/components/list-items/BaseListItemClient.vue';
import BaseModalClientCreate from '@thxnetwork/dashboard/components/modals/BaseModalClientCreate.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';
import { AccountPlanType } from '@thxnetwork/types/enums';
import { TClient, TAccount } from '@thxnetwork/types/interfaces';

const exampleCode = `import { THXAPIClient } from '@thxnetwork/sdk';

const thx = new THXAPIClient({
    clientId: 'chyBeltL7rmOeTwVu-YiM',
    clientSecret: 'q4ilZuGA4VPtrGhXug3i5taXrvDtidrzyv-gJN3yVo8T2stL6RwYQjqRoK-iUiAGGvhbG_F3TEFFuD_56Q065Q'
});
`;

@Component({
    components: {
        BaseListItemClient,
        BaseModalClientCreate,
        BaseCardTableHeader,
        BaseCode,
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
    code = exampleCode;
    actions = [];

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
        return Object.values(this.clients[this.$route.params.id]).map((r: TClient) => ({
            name: r.name,
            grantType: r.grantType,
            info: {
                clientId: r.clientId,
                clientSecret: r.clientSecret,
            },
            id: r._id,
        }));
    }

    mounted() {
        this.listClients();
    }

    onChangePage(page: number) {
        this.page = page;
        this.listClients();
    }

    onSubmit() {
        this.listClients();
    }

    async listClients() {
        if (!this.account || this.account.plan !== AccountPlanType.Premium) return;
        this.isLoading = true;
        await this.$store.dispatch('clients/list', this.pool);
        this.isLoading = false;
    }
}
</script>
