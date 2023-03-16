<template>
    <b-card class="shadow-sm mb-5">
        <b-row class="justify-content-end mb-3">
            <b-button variant="primary" v-b-modal="'modalClientCreate'" class="rounded-pill">
                <i class="fas fa-plus mr-2"></i>
                Create Client
            </b-button>
        </b-row>
        <base-list-item-client :pool="pool" :client="client" :key="client.clientId" v-for="client of filteredClients" />
        <b-pagination
            v-if="total > limit"
            class="mt-3"
            @change="onChangePage"
            v-model="page"
            :per-page="limit"
            :total-rows="total"
            align="center"
        ></b-pagination>
        <base-modal-client-create :pool="pool" :page="page" @submit="onSubmit" />
    </b-card>
</template>
<script lang="ts">
import { mapGetters, mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TClient } from '@thxnetwork/dashboard/store/modules/clients';
import BaseListItemClient from '@thxnetwork/dashboard/components/list-items/BaseListItemClient.vue';
import BaseModalClientCreate from '@thxnetwork/dashboard/components/modals/BaseModalClientCreate.vue';
import { TPool } from '@thxnetwork/types/index';

@Component({
    components: {
        BaseListItemClient,
        BaseModalClientCreate,
    },
    computed: {
        ...mapState('clients', ['total']),
        ...mapGetters({
            clients: 'clients/all',
        }),
    },
})
export default class BaseCardPoolClients extends Vue {
    @Prop() pool!: TPool;

    page = 1;
    limit = 5;
    isLoading = true;

    total!: number;
    clients!: { [id: string]: TClient };

    get filteredClients() {
        return Object.values(this.clients)
            .filter((client: TClient) => client.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, 5);
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
    }

    async listClients() {
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
