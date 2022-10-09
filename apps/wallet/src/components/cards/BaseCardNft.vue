<template>
  <b-card class="mb-3" :img-src="imgUrl" img-alt="Image" img-top>
    <strong class="mr-2">{{ token.erc721.name }} #{{ token.tokenId }}</strong>
    <hr />
    <div v-if="mdata">
      <b-form-group label="Title" label-class="text-muted">{{
        mdata.title
      }}</b-form-group>
      <b-form-group label="Description" label-class="text-muted">{{
        mdata.description
      }}</b-form-group>
      <b-form-group label="Attributes" label-class="text-muted">
        <b-badge
          variant="darker"
          v-b-tooltip
          :title="value"
          class="p-2 mr-1 mb-1 rounded-pill"
          :key="key"
          v-for="(value, key) in mdata.attributes"
        >
          {{ key }}
        </b-badge>
      </b-form-group>
      <hr />
    </div>
    <b-button
      block
      class="rounded-pill"
      variant="primary"
      :href="token.erc721.blockExplorerUrl + `?a=${token.tokenId}#inventory`"
      target="_blank"
    >
      Visit Block Explorer
      <i class="fas fa-external-link-alt ml-2"></i>
    </b-button>
    <b-button
      block
      class="rounded-pill"
      variant="link"
      :href="token.tokenUri"
      target="_blank"
    >
      View metadata
      <i class="fas fa-photo-video ml-2"></i>
    </b-button>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  TERC721Metadata,
  TERC721Token,
} from '@thxnetwork/wallet/store/modules/erc721';
import BaseModalTransferTokens from '@thxnetwork/wallet/components/modals/ModalTransferTokens.vue';
import BaseCardErc721Token from '@thxnetwork/wallet/components/cards/BaseCardERC721Token.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import { mapState } from 'vuex';

@Component({
  components: {
    BaseCardErc721Token,
    BaseModalTransferTokens,
    BaseIdenticon,
  },
  computed: {
    ...mapState('erc721', ['metadata']),
  },
})
export default class BaseCardNFT extends Vue {
  metadata!: { [_tokenId: string]: TERC721Metadata };

  get mdata() {
    if (!this.token) return null;
    return this.metadata[this.token._id];
  }

  @Prop() token!: TERC721Token;

  mounted() {
    this.$store.dispatch('erc721/getMetadata', this.token);
  }

  get imgUrl() {
    if (!this.mdata) return null;

    let url = '';
    this.token.erc721.properties.forEach((p) => {
      if (!this.mdata) return null;
      if (p.propType === 'image') {
        url = this.mdata.attributes[p.name];
      }
    });
    return url;
  }
}
</script>
