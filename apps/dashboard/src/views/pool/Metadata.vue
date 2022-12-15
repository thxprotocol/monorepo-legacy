<template>
  <div>
    <b-row class="mb-3">
      <b-col class="d-flex align-items-center">
        <h2 class="mb-0">Metadata</h2>
      </b-col>
      <b-dropdown variant="light" dropleft no-caret size="sm" class="ml-2">
        <template #button-content>
          <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" style="font-size: 1.2rem"></i>
        </template>
        <b-dropdown-item v-b-modal="'modalNFTCreate'" @click="onCreate()">
          <i class="fas fa-plus mr-2"></i>
          Create Metadata
        </b-dropdown-item>
        <b-dropdown-item v-b-modal="'modalNFTBulkCreate'">
          <i class="fas fa-upload mr-2"></i>
          Upload Images
        </b-dropdown-item>
        <b-dropdown-item v-b-modal="'modalNFTUploadMetadataCsv'">
          <i class="fas fa-exchange-alt mr-2"></i>
          Import/Export
        </b-dropdown-item>
        <b-dropdown-item @click="getQRCodes()">
          <i class="fas fa-download mr-2"></i>
          Download Rewards
        </b-dropdown-item>
      </b-dropdown>
    </b-row>
    <b-row>
      <b-alert variant="success" show v-if="isDownloadScheduled">
        <i class="fas fa-clock mr-2"></i>
        You will receive an e-mail when your download is ready!
      </b-alert>
      <b-alert variant="info" show v-if="isDownloading">
        <i class="fas fa-hourglass-half mr-2"></i>
        Downloading your QR codes
      </b-alert>
    </b-row>

    <BCard variant="white" body-class="p-0 shadow-sm">
      <BTable hover :busy="isLoading" :items="metadataByPage" responsive="lg" :fields="fields" show-empty>
        <!-- Head formatting -->
        <template #head(checkbox)>
          <b-form-checkbox @change="onChecked" />
        </template>
        <template #head(title)> Created </template>
        <template #head(progress)> Attributes </template>
        <template #head(rewardCondition)> Tokens </template>
        <template #head(id)> &nbsp; </template>

        <!-- Cell formatting -->
        <template #cell(checkbox)="{ item }">
          <b-form-checkbox v-model="selectedItems" />
        </template>
        <template #cell(attributes)="{ item }">
          <b-badge :key="key" v-for="(atribute, key) in item.attributes" variant="dark" v-b-tooltip
            :title="atribute.value" class="mr-2">
            {{ atribute.key }}
          </b-badge>
        </template>
        <template #cell(tokens)="{ item }">
          <b-badge class="mr-2" variant="dark" :key="token.tokenId" v-for="token of item.tokens" v-b-tooltip :title="`Minted at: ${format(
            new Date(token.createdAt),
            'dd-MM-yyyy HH:mm'
          )}`">
            #{{ token.tokenId }}
          </b-badge>
        </template>
        <template #cell(createdAt)="{ item }">
          {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
        </template>
        <template #cell(id)="{ item }">
          <b-dropdown size="sm" class="float-right" variant="light">
            <b-dropdown-item :disabled="!!item.tokens.length" @click="onEdit(item)">Edit</b-dropdown-item>
            <b-dropdown-item target="_blank" :href="`${apiUrl}/v1/metadata/${item._id}`">View</b-dropdown-item>
            <b-dropdown-item v-b-modal="`modalNFTMint${item._id}`">Mint</b-dropdown-item>
            <b-dropdown-item :disabled="!!item.tokens.length" @click="onDelete(item)">Delete</b-dropdown-item>
          </b-dropdown>

          <base-modal-erc721-metadata-mint :pool="pool" :erc721="erc721" :erc721Metadata="item" />
        </template>

      </BTable>
    </BCard>

    <base-modal-erc721-metadata-create v-if="erc721" :erc721="erc721" @hidden="reset" :metadata="editingMeta"
      :pool="pool" />

  </div>
</template>

<script lang="ts">
import { format } from 'date-fns';
import { IPool, IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type {
  IERC721s,
  TERC721,
  TERC721Metadata,
} from '@thxnetwork/dashboard/types/erc721';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BaseCardErc721Metadata from '@thxnetwork/dashboard/components/cards/BaseCardERC721Metadata.vue';
import BaseModalErc721MetadataCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataCreate.vue';
import BaseModalErc721MetadataBulkCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataBulkCreate.vue';
import BaseModalErc721MetadataUploadCSV from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataUploadCSV.vue';
import BaseModalErc721MetadataCreateCSV from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataCreateCSV.vue';
import BaseModalErc721MetadataMint from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataMint.vue';



@Component({
  components: {
    BaseNothingHere,
    BaseCardErc721Metadata,
    BaseModalErc721MetadataCreate,
    BaseModalErc721MetadataBulkCreate,
    BaseModalErc721MetadataUploadCSV,
    BaseModalErc721MetadataCreateCSV,
    BaseModalErc721MetadataMint,
  },
  computed: mapGetters({
    pools: 'pools/all',
    erc721s: 'erc721/all',
    totals: 'erc721/totalsMetadata',
  }),
})
export default class MetadataView extends Vue {
  page = 1;
  limit = 15;
  isLoading = true;
  format = format

  totals!: { [erc721Id: string]: number };

  docsUrl = process.env.VUE_APP_DOCS_URL;
  apiUrl = process.env.VUE_APP_API_ROOT;
  widgetUrl = process.env.VUE_APP_WIDGET_URL;

  qrURL = '';
  isDownloading = false;
  isDownloadScheduled = false;
  selectedItems: any[] = []

  pools!: IPools;
  erc721s!: IERC721s;
  editingMeta: TERC721Metadata | null = null;

  fields = ["createdAt", "attributes", "tokens", "id"];

  get pool(): IPool {
    return this.pools[this.$route.params.id];
  }

  get erc721(): TERC721 {
    return this.erc721s[this.pool.erc721Id];
  }

  get total() {
    return this.erc721 ? this.totals[this.erc721._id] : 0;
  }

  get metadataByPage() {
    if (!this.erc721s[this.erc721?._id]?.metadata) return [];
    return Object.values(this.erc721s[this.erc721._id].metadata)
      .filter((metadata: TERC721Metadata) => metadata.page === this.page)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, this.limit);
  }

  onChangePage(page: number) {
    this.page = page;
    this.listMetadata();
  }

  onChecked(checked: boolean) {
    this.selectedItems = checked ? (this.metadataByPage.map((r) => r._id) as string[]) : [];
  }

  reset() {
    Vue.set(this, 'editingMeta', null);
  }

  onEdit(metadata: TERC721Metadata) {
    Vue.set(this, 'editingMeta', metadata);
    this.$bvModal.show('modalNFTCreate');
  }

  async onDelete(metadata: TERC721Metadata) {
    await this.$store.dispatch('erc721/deleteMetadata', { pool: this.pool, erc721: this.erc721, metadataId: metadata._id });
    this.listMetadata()
  }

  onCreate() {
    this.reset();
    this.$bvModal.show('modalNFTCreate');
  }

  downloadQrCodes() {
    this.$store.dispatch('erc721/getQRCodes', { erc721: this.erc721 });
  }

  async listMetadata() {
    this.isLoading = true;
    await this.$store
      .dispatch('erc721/read', this.pool.erc721._id)
      .then(async () => {
        await this.$store.dispatch('erc721/listMetadata', {
          erc721: this.erc721,
          page: this.page,
          limit: this.limit,
        });
      });
    this.isLoading = false;
  }

  async onSuccess() {
    await this.listMetadata();
    this.reset();
  }

  async mounted() {
    this.listMetadata();
    if (this.$route.query.qrcodes === '1') {
      await this.getQRCodes();
    }
  }

  async getQRCodes() {
    this.isDownloading = true;
    this.isDownloadScheduled = await this.$store.dispatch(
      'erc721/getMetadataQRCodes',
      {
        pool: this.pool,
        erc721: this.erc721,
      }
    );
    this.isDownloading = false;
  }
}
</script>
