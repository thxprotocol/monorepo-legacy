<template>
    <b-form-row>
        <b-col md="4">
            <strong>API Keys</strong>
            <p class="text-muted">Register OAuth2 clients and build your own frontend against THX API's.</p>
            <BaseCode :codes="[code]" :languages="['JavaScript']" />
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
                        New API Key
                    </b-button>
                    <BaseModalClientCreate id="modalClientCreate" :pool="pool" @submit="onSubmit" />
                </template>
                <BTable hover :busy="isLoading" :items="clients" responsive="lg" show-empty>
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
                            <b-dropdown-item v-b-modal="`modalClientCreate${item.id}`"> Edit </b-dropdown-item>
                        </b-dropdown>
                        <BaseModalClientCreate
                            :id="`modalClientCreate${item.id}`"
                            :pool="pool"
                            :client="clientList[pool._id][item.id]"
                            @submit="onSubmit"
                        />
                    </template>
                </BTable>
            </b-form-group>
        </b-col>
    </b-form-row>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import type { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import type { TClient, TClientState } from '@thxnetwork/types/interfaces';
import BaseModalClientCreate from '@thxnetwork/dashboard/components/modals/BaseModalClientCreate.vue';
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';

const exampleCode = `import { THXAPIClient } from '@thxnetwork/sdk';

const thx = new THXAPIClient({
    clientId: 'chyBeltL7rmOeTwVu-YiM',
    clientSecret: 'q4ilZuGA4VPtrGhXug3i5taXrvDtidrzyv-gJN3yVo8T2stL6RwYQjqRoK-iUiAGGvhbG_F3TEFFuD_56Q065Q'
});
`;

@Component({
    components: {
        BaseModalClientCreate,
        BaseCode,
    },
    computed: mapGetters({
        pools: 'pools/all',
        clientList: 'clients/all',
    }),
})
export default class Clients extends Vue {
    page = 1;
    limit = 5;
    isLoading = true;
    code = exampleCode;
    pools!: IPools;
    clientList!: TClientState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get clients() {
        if (!this.clientList[this.$route.params.id]) return [];
        return Object.values(this.clientList[this.$route.params.id]).map((client: TClient) => ({
            name: client.name,
            grantType: client.grantType,
            info: {
                clientId: client.clientId,
                clientSecret: client.clientSecret,
            },
            id: client._id,
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
        this.isLoading = true;
        await this.$store.dispatch('clients/list', this.pool);
        this.isLoading = false;
    }
}
</script>
