<template>
  <base-modal
    @show="onShow"
    :loading="loading"
    :error="error"
    title="Create Token Pool"
    :id="`modalAssetPoolCreate_${tokenId}`"
  >
    <template #modal-body v-if="!loading">
      <base-form-select-network :chainId="chainId" @selected="onSelectChain" />
      <b-form-group>
        <label> Token Contract </label>
        <div v-if="erc20">
          <div class="d-flex align-items-center">
            <base-identicon
              class="mr-3"
              :size="20"
              variant="darker"
              :uri="erc20.logoURI"
            />
            <strong class="mr-1">{{ erc20.symbol }}</strong> {{ erc20.name }}
          </div>
        </div>
        <base-dropdown-select-erc20
          v-else
          :chainId="chainId"
          @selected="onSelectERC20Token"
        />
      </b-form-group>
      <b-form-group>
        <label> NFT Contract </label>
        <div v-if="erc721">
          <div class="d-flex align-items-center">
            <base-identicon
              class="mr-3"
              size="20"
              variant="darker"
              :uri="erc721.logoURI"
            />
            <strong class="mr-1">{{ erc721.symbol }}</strong> {{ erc721.name }}
          </div>
        </div>
        <base-dropdown-select-erc-721
          v-else
          :chainId="chainId"
          @selected="onSelectERC721Token"
        />
      </b-form-group>
    </template>
    <template #btn-primary>
      <b-button
        :disabled="disabled"
        class="rounded-pill"
        @click="submit()"
        variant="primary"
        block
      >
        Create Pool
      </b-button>
    </template>
  </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormSelectNetwork from '@thxnetwork/dashboard/components/form-select/BaseFormSelectNetwork.vue';
import BaseDropdownSelectErc20 from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownSelectERC20.vue';
import BaseDropdownSelectMultipleErc20 from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownSelectMultipleERC20.vue';
import BaseDropdownSelectErc721 from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownSelectERC721.vue';
import BaseModal from './BaseModal.vue';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
  components: {
    BaseModal,
    BaseFormSelectNetwork,
    BaseDropdownSelectErc20,
    BaseDropdownSelectMultipleErc20,
    BaseDropdownSelectErc721,
    BaseIdenticon,
  },
  computed: mapGetters({
    profile: 'account/profile',
    erc20s: 'erc20/all',
  }),
})
export default class ModalAssetPoolCreate extends Vue {
  loading = false;
  error = '';
  chainId: ChainId = ChainId.PolygonMumbai;
  poolVariant = 'defaultPool';
  erc20Selectedtokens: TERC20[] = [];
  erc721Selectedtokens: TERC721[] = [];
  profile!: IAccount;

  @Prop() tokenId!: string;
  @Prop() erc20?: TERC20;
  @Prop() erc721?: TERC721;

  get disabled() {
    return (
      this.loading ||
      (!this.erc20 &&
        !this.erc721 &&
        !this.erc20Selectedtokens.length &&
        !this.erc721Selectedtokens.length)
    );
  }

  onShow() {
    if (this.erc20) this.chainId = this.erc20.chainId;
    if (this.erc721) this.chainId = this.erc721.chainId;
  }

  onSelectChain(chainId: ChainId) {
    this.chainId = chainId;
    this.erc20Selectedtokens = [];
  }

  onSelectERC20Token(token: TERC20) {
    this.erc20Selectedtokens = token ? [token] : [];
  }

  onSelectERC721Token(token: TERC721) {
    this.erc721Selectedtokens = token ? [token] : [];
  }

  async submit() {
    this.loading = true;

    if (!this.erc20Selectedtokens.length && this.erc20) {
      this.erc20Selectedtokens = [this.erc20];
    }
    if (!this.erc721Selectedtokens.length && this.erc721) {
      this.erc721Selectedtokens = [this.erc721];
    }

    await this.$store.dispatch('pools/create', {
      chainId: this.chainId,
      erc20tokens: this.erc20Selectedtokens.map((t) => t.address), // TODO make this t._id and have API support it
      erc721tokens: this.erc721Selectedtokens.map((t) => t.address), // TODO make this t._id and have API support it
      variant: this.poolVariant,
    });
    this.$bvModal.hide(`modalAssetPoolCreate_${this.tokenId}`);
    this.loading = false;
    this.$emit('created');
  }
}
</script>
