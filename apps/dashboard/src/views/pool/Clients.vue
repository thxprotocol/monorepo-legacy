<template>
<<<<<<< HEAD
    <div class="pb-5">
        <b-row class="mb-3">
            <b-col class="d-flex justify-content-end">
                <b-button variant="primary" v-b-modal="'modalClientCreate'" class="rounded-pill">
                    <i class="fas fa-plus mr-2"></i>
                    Create Client
                </b-button>
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="totals[pool._id]"
                :selectedItems="selectedItems"
                :actions="actions"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
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
        </BCard>
    </div>
=======
  <div>
    <b-row class="mb-3">
      <b-col class="d-flex align-items-center">
        <h2 class="mb-0">Clients</h2>
      </b-col>
      <b-col class="d-flex justify-content-end">
        <b-button v-b-modal="'modalRewardPointsCreate'" class="rounded-pill" variant="primary">
          <i class="fas fa-plus mr-2"></i>
          <span class="d-none d-md-inline">Clients</span>
        </b-button>
        <base-modal-client-create @hidden="onClose" :client="editingClient" :pool="pool" :page="page"
          @submit="onSubmit" /> </b-col>
    </b-row>
    <BCard variant="white" body-class="p-0 shadow-sm">
      <BaseCardTableHeader :page="page" :limit="limit" :pool="pool" :total-rows="totals[pool._id]"
        :selectedItems="selectedItems" :actions="[{ variant: 0, label: `Delete rewards` }]"
        @click-action="onClickAction" @change-page="onChangePage" @change-limit="onChangeLimit" />
      <BTable :fields="fields" hover :busy="isLoading" :items="clientsByPage" responsive="lg" show-empty>
        <!-- Head formatting -->
        <template #head(checkbox)>
          <b-form-checkbox @change="onChecked" />
        </template>
        <template #head(name)> Client Name </template>
        <template #head(type)> Grant Type </template>
        <template #head(clientInfo)> Client ID </template>
        <template #head(id)> &nbsp; </template>

        <!-- Cell formatting -->
        <template #cell(checkbox)="{ item }">
          <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
        </template>
        <template #cell(name)="{ item }">
          <strong class="text-primary">{{ item.name }} </strong>
        </template>
        <template #cell(type)="{ item }">
          {{ item.grantType }}
        </template>
        <template #cell(clientInfo)="{ item }">
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
                <b-form-input readonly size="sm" :value="item.clientSecret" />
                <template #append>
                  <b-button size="sm" variant="dark"
                    v-clipboard:copy="item.clientSecret && Array.from({ length: item.clientSecret.length }).map(() => '•').join('')">
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
            <b-dropdown-item v-b-modal="'modalRewardPointsCreate' + item.id">Edit</b-dropdown-item>
            <b-dropdown-item @click="$store.dispatch('clients/delete', clients[pool._id][item.id])">
              Delete
            </b-dropdown-item>
          </b-dropdown>
          <base-modal-client-create :id="'modalRewardPointsCreate' + item.id" @hidden="onClose"
            :client="clients[pool._id][item.id]" :pool="pool" :page="page" @submit="onSubmit" />
        </template>
      </BTable>
    </BCard>
  </div>
  <!-- <div>
    <b-row class="mb-3">
      <b-col class="d-flex align-items-center">
        <h2 class="mb-0">Clients</h2>
      </b-col>
      <b-col class="d-flex justify-content-end">
        <b-button
          variant="primary"
          v-b-modal="'modalClientCreate'"
          class="rounded-pill"
        >
          <i class="fas fa-plus mr-2"></i>
          Create Client
        </b-button>
        <base-modal-client-create
          @hidden="onClose"
          :client="editingClient"
          :pool="pool"
          :page="page"
          @submit="onSubmit"
        />
      </b-col>
    </b-row>
    <base-list-item-client
      @edit="onEdit"
      :pool="pool"
      :client="client"
      :key="client.clientId"
      v-for="client of clientsByPage"
    />
    <b-pagination
      v-if="total > limit"
      class="mt-3"
      @change="onChangePage"
      v-model="page"
      :per-page="limit"
      :total-rows="total"
      align="center"
    ></b-pagination>
  </div> -->
>>>>>>> abedbe93 (fix: add watch deps back)
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { TClient } from '@thxnetwork/dashboard/store/modules/clients';
import BaseListItemClient from '@thxnetwork/dashboard/components/list-items/BaseListItemClient.vue';
import BaseModalClientCreate from '@thxnetwork/dashboard/components/modals/BaseModalClientCreate.vue';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';

@Component({
<<<<<<< HEAD
    components: {
        BaseListItemClient,
        BaseModalClientCreate,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        totals: 'clients/totals',
        clients: 'clients/all',
        pools: 'pools/all',
    }),
})
export default class Clients extends Vue {
    page = 1;
    limit = 5;
    isLoading = true;
=======
  components: {
    BaseListItemClient,
    BaseModalClientCreate,
    BaseCardTableHeader
  },
  computed: mapGetters({
    totals: 'clients/totals',
    clients: 'clients/all',
    pools: 'pools/all',
  }),
})
export default class Clients extends Vue {
  [x: string]: any;
  page = 1;
  limit = 5;
  isLoading = true;
  selectedItems: string[] = [];
>>>>>>> abedbe93 (fix: add watch deps back)

    fields = ['checkbox', 'name', 'type', 'info', 'id'];
    actions = [];

<<<<<<< HEAD
    shouldDisableActions = !this.actions.length;
=======
  fields = ['checkbox', 'name', 'type', 'clientInfo', 'id']


  onChecked(checked: boolean) {
    this.selectedItems = checked ? (this.clientsByPage.map((r) => r._id) as string[]) : [];
  }

  get total() {
    return this.totals[this.$route.params.id];
  }
>>>>>>> abedbe93 (fix: add watch deps back)

    totals!: { [poolId: string]: number };
    clients!: { [poolId: string]: { [id: string]: TClient } };
    editingClient: TClient | null = null;
    pools!: IPools;

<<<<<<< HEAD
    selectedItems: string[] = [];
=======
  get clientsByPage() {
    return Object.values(this.clients[this.$route.params.id])
      .filter((client: TClient) => client.page === this.page)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, this.limit);
  }
>>>>>>> abedbe93 (fix: add watch deps back)

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

    onClickAction(action: { variant: number; label: string }) {
        /** Not yet implemented bulk actions */
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
