<template>
    <b-alert show variant="danger"> Wrong chain</b-alert>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: {
        ...mapGetters({
            profile: 'account/profile',
            chainId: 'network/chainIdd',
            address: 'network/address',
        }),
    },
})
export default class BaseAnchorAddress extends Vue {
    chainInfo = chainInfo;

    @Prop() address!: string;
    @Prop() chainId!: ChainId;
    @Prop() variant!: string;

    openAddressUrl() {
        const url = `${chainInfo[this.chainId].blockExplorer}/address/${this.address}`;
        return (window as any).open(url, '_blank').focus();
    }
}
</script>
