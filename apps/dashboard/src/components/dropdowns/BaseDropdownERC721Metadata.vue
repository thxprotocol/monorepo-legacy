<template>
  <b-dropdown variant="link" class="dropdown-select">
    <template #button-content>{{
      selectedMetadata
        ? selectedMetadata.title || '-'
        : 'Select the NFT to Mint'
    }}</template>
    <b-dropdown-form>
      <b-form-input
        class="mb-2"
        placeholder="Search..."
        @input="onSearch"
        v-model="q"
      />
    </b-dropdown-form>
    <div style="height: 250px; overflow-y: scroll">
      <b-dropdown-item-button
        :key="metadata._id"
        v-for="metadata of options"
        @click="
          $emit('selected', metadata);
          selectedMetadata = metadata;
        "
      >
        <div class="d-flex justify-content-between">
          <div>
            {{ metadata.title || 'No Title' }}
          </div>
          <div>
            <b-badge
              :key="key"
              v-for="(value, key) in metadata.attributes"
              variant="dark"
              v-b-tooltip
              :title="value.value"
              class="mr-2"
            >
              {{ value.key }}
            </b-badge>
          </div>
          <small class="text-muted">
            {{ format(new Date(metadata.createdAt), 'dd-MM-yyyy HH:mm') }}
          </small>
        </div>
      </b-dropdown-item-button>
    </div>
    <b-dropdown-form>
      <b-pagination
        v-if="total > limit"
        class="mt-3"
        @change="onChangePage"
        v-model="page"
        :per-page="limit"
        :total-rows="total"
        align="center"
      ></b-pagination>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script lang="ts">
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import {
  BDropdown,
  BDropdownItemButton,
  BBadge,
  BSpinner,
} from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';

@Component({
  components: {
    BBadge,
    BDropdown,
    BDropdownItemButton,
    BSpinner,
  },
  computed: mapGetters({
    erc721s: 'erc721/all',
  }),
})
export default class BaseDropdownERC721Metadata extends Vue {
  format = format;
  erc721s!: IERC721s;
  selectedMetadata: TERC721Metadata | null = null;
  limit = 50;
  page = 1;
  total = 0;
  options: TERC721Metadata[] = [];
  q: string | null = null;

  get erc721(): TERC721 {
    return this.erc721s[this.pool.erc721._id];
  }

  @Prop() pool!: IPool;
  @Prop({ required: false }) erc721metadata!: TERC721Metadata;

  mounted() {
    if (this.pool.erc721) {
      this.$store
        .dispatch('erc721/read', this.pool.erc721._id)
        .then(async () => {
          await this.listMetadata();
        });
    }
    this.selectedMetadata = this.erc721metadata;
  }

  async listMetadata() {
    const data = await this.$store.dispatch('erc721/listMetadata', {
      erc721: this.pool.erc721,
      page: this.page,
      limit: this.limit,
      q: this.q,
    });

    this.options = data.results;
    this.total = data.total;
  }

  async onChangePage(page: number) {
    this.page = page;
    await this.listMetadata();
  }

  async onSearch(query: string) {
    this.q = query;
    await this.listMetadata();
  }
}
</script>
<style lang="scss">
.dropdown-menu {
  background-color: #f8f9fa;
}
</style>
