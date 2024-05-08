<template>
    <b-dropdown size="sm" variant="link" right no-caret toggle-class="d-flex align-items-center float-right">
        <template #button-content>
            <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
        </template>
        <b-dropdown-item size="sm" variant="dark" @click.stop="$emit('archive')">
            <span class="text-muted">
                <i class="fas fa-archive mr-3"></i>
                {{ !archived ? 'Archive' : 'Unarchive' }}
            </span>
        </b-dropdown-item>
        <b-dropdown-item size="sm" variant="dark" @click.stop="openTokenUrl()">
            <span class="text-muted">
                <i class="fa fa-external-link mr-3"></i>
                View in Block Explorer
            </span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import type { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownMenuNft extends Vue {
    @Prop() nft!: TERC721 | TERC1155;
    @Prop() archived!: boolean;

    openTokenUrl() {
        const url = `${chainInfo[this.nft.chainId].blockExplorer}/token/${this.nft.address}`;
        return (window as any).open(url, '_blank').focus();
    }
}
</script>
