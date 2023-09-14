<template>
    <div v-if="wallet" class="d-flex align-items-center">
        <b-img :src="wallet.chain.logoUrl" alt="" class="mr-2" v-b-tooltip :title="wallet.chain.name" height="12" />
        <b-link :href="wallet.url" target="link">{{ wallet.shortAddress }}</b-link>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { chainInfo, getAddressURL } from '../utils/chains';
import { shortenAddress } from '../utils/wallet';

export function parseWallet(wallet: any) {
    if (!wallet) return;
    return {
        address: wallet.address,
        shortAddress: shortenAddress(wallet.address),
        url: getAddressURL(wallet.chainId, wallet.address),
        chain: {
            name: chainInfo[wallet.chainId].name,
            logoUrl: chainInfo[wallet.chainId].logo,
        },
    };
}

@Component({})
export default class BaseParticipantWallet extends Vue {
    @Prop() wallet!: { chain: { logoUrl: string; name: string }; shortAddress: string; url: string };
}
</script>
