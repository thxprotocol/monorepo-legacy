<template>
    <b-link @click.stop="openAddressUrl()" class="d-flex align-items-center">
        <span class="text-truncate">
            {{ address }}
        </span>
        <i class="fas fa-external-link-alt ml-1" />
    </b-link>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseAnchorAddress extends Vue {
    @Prop() address!: string;
    @Prop() chainId!: ChainId;

    openAddressUrl() {
        const url = `${chainInfo[this.chainId].blockExplorer}/address/${this.address}`;
        return (window as any).open(url, '_blank').focus();
    }
}
</script>
