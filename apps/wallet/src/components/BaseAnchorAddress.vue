<template>
  <b-badge
    @click="openAddressUrl()"
    target="_blank"
    :variant="variant || 'primary'"
    class="rounded-pill d-inline-flex cursor-pointer"
  >
    <span class="text-overflow-75">{{ address }}</span>
    <i
      v-b-tooltip
      title="View details of this account on the block explorer"
      class="fas fa-external-link-alt mx-1"
    ></i>
  </b-badge>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseAnchorAddress extends Vue {
  chainInfo = chainInfo;

  @Prop() address!: string;
  @Prop() chainId!: ChainId;
  @Prop() variant!: string;

  openAddressUrl() {
    const url = `${chainInfo[this.chainId].blockExplorer}/address/${
      this.address
    }`;
    return (window as any).open(url, '_blank').focus();
  }
}
</script>
