<template>
    <b-link @click="openAddressUrl()" class="text-truncate">
        {{ address }}
    </b-link>
</template>

<script lang="ts">
import { ChainId } from '@thxprotocol/dashboard/types/enums/ChainId';
import { chainInfo } from '@thxprotocol/dashboard/utils/chains';
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
