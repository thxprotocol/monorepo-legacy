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
    <base-nothing-here v-if="erc721 && !erc721.metadata" text-submit="Create NFT Metadata"
      title="You have not created NFT Metadata yet"
      description="NFT Metadata is the actual data that is attached to your token."
      @clicked="$bvModal.show('modalNFTCreate')" />
    <base-card-erc721-metadata @edit="onEdit" @delete="onDelete" v-if="erc721 && erc721.metadata" :erc721="erc721"
      :metadata="metadataByPage" :pool="pool" />
    <b-pagination v-if="erc721s && erc721 && erc721.metadata && total > limit" class="mt-3" @change="onChangePage"
      v-model="page" :per-page="limit" :total-rows="total" align="center"></b-pagination>
    <base-modal-erc721-metadata-create v-if="erc721" @hidden="reset" :metadata="editingMeta" :pool="pool"
      :erc721="erc721" @success="listMetadata()" />
    <base-modal-erc721-metadata-bulk-create v-if="erc721" :pool="pool" :erc721="erc721" @success="listMetadata()" />
    <BaseModalErc721MetadataUploadCSV v-if="erc721" :pool="pool" :erc721="erc721" @success="onSuccess()" />
  </div>
</template>

<script lang="ts">
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

@Component({
  components: {
    BaseNothingHere,
    BaseCardErc721Metadata,
    BaseModalErc721MetadataCreate,
    BaseModalErc721MetadataBulkCreate,
    BaseModalErc721MetadataUploadCSV,
    BaseModalErc721MetadataCreateCSV,
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

  totals!: { [erc721Id: string]: number };

  docsUrl = process.env.VUE_APP_DOCS_URL;
  apiUrl = process.env.VUE_APP_API_ROOT;
  widgetUrl = process.env.VUE_APP_WIDGET_URL;

  qrURL = '';
  isDownloading = false;
  isDownloadScheduled = false;

  pools!: IPools;
  erc721s!: IERC721s;
  editingMeta: TERC721Metadata | null = null;

  get pool(): IPool {
    return this.pools[this.$route.params.id];
  }

  get erc721(): TERC721 {
    return this.erc721s[this.pool.erc721Id];
  }

  get total() {
    return this.totals[this.erc721._id];
  }

  get metadataByPage() {
    if (!this.erc721s[this.erc721._id].metadata) return [];
    return Object.values(this.erc721s[this.erc721._id].metadata)
      .filter((metadata: TERC721Metadata) => metadata.page === this.page)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, this.limit);
  }

  onChangePage(page: number) {
    this.page = page;
    this.listMetadata();
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
