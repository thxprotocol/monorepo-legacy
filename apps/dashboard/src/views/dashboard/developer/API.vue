<template>
    <b-form-row>
        <b-col md="4">
            <strong>API Keys</strong>
            <p class="text-muted">Register OAuth2 clients and build your own frontend against THX API's.</p>
            <BaseCode :codes="[code]" :languages="['JavaScript']" />
        </b-col>
        <b-col md="8">
            <b-form-group label-class="d-flex align-items-center justify-content-between">
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
                    <BaseModalClientCreate id="modalClientCreate" @submit="onSubmit" />
                </template>
                <BTable hover :busy="isLoading" :items="clients" responsive="lg" show-empty>
                    <!-- Head formatting -->
                    <template #head(name)> Name </template>
                    <template #head(secret)> Secret </template>
                    <template #head(createdAt)>Created </template>
                    <template #head(id)> &nbsp; </template>

                    <!-- Cell formatting -->
                    <template #cell(name)="{ item }">
                        {{ item.name }}
                    </template>
                    <template #cell(secret)="{ item }">
                        <b-input-group size="sm" class="mb-2">
                            <b-form-input readonly size="sm" :value="item.secret" />
                            <template #append>
                                <b-button size="sm" variant="dark" v-clipboard:copy="item.secret">
                                    <i class="fas fa-clipboard m-0"></i>
                                </b-button>
                            </template>
                        </b-input-group>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">
                            {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </template>
                    <template #cell(id)="{ item }">
                        <b-dropdown variant="link" size="sm" no-caret right>
                            <template #button-content>
                                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                            </template>
                            <b-dropdown-item v-b-modal="`modalClientCreate${item.id}`"> Edit </b-dropdown-item>
                            <!-- <b-dropdown-item v-b-modal="`modalClientDelete${item.id}`"> Delete </b-dropdown-item> -->
                        </b-dropdown>
                        <BaseModalClientCreate
                            :id="`modalClientCreate${item.id}`"
                            :client="clientList[item.id]"
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
import BaseModalClientCreate from '@thxnetwork/dashboard/components/modals/BaseModalClientCreate.vue';
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';
import { format } from 'date-fns';

const exampleCode = `import { THXAPIClient } from '@thxnetwork/sdk';

const thx = new THXAPIClient({
    apiKey: 'q4ilZuGA4VPtrGhXug3i5taXrvDtidrzyv-gJN3yVo8T2stL6RwYQjqRoK-iUiAGGvhbG_F3TEFFuD_56Q065Q'
});
`;

@Component({
    components: {
        BaseModalClientCreate,
        BaseCode,
    },
    computed: mapGetters({
        pools: 'pools/all',
        clientList: 'developer/clients',
    }),
})
export default class Clients extends Vue {
    page = 1;
    limit = 5;
    isLoading = true;
    code = exampleCode;
    pools!: IPools;
    clientList!: TClientState;
    format = format;

    get clients() {
        if (!this.clientList) return [];
        return Object.values(this.clientList).map((client: TClient) => ({
            name: client.name,
            secret: client.secret,
            createdAt: client.createdAt,
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
        await this.$store.dispatch('developer/listClients');
        this.isLoading = false;
    }
}
</script>
