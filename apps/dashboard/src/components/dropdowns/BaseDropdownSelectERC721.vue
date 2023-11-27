<template>
    <b-dropdown variant="link" class="dropdown-select" v-if="hasNFTs">
        <template #button-content>
            <div class="d-flex align-items-center" v-if="token && token.chainId === chainId">
                <base-identicon class="mr-3" :size="20" variant="darker" :uri="token.logoURI" />
                <span class="mr-1">{{ token.name }}</span>
            </div>
            <div v-else>Select an NFT</div>
        </template>
        <b-dropdown-item-button @click="onTokenListItemClick(null)"> None </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-text>ERC721</b-dropdown-text>
        <b-dropdown-item-button
            :disabled="chainId !== erc721.chainId"
            :key="erc721._id"
            v-for="erc721 of erc721s"
            @click="onTokenListItemClick(erc721)"
        >
            <div class="d-flex align-items-center">
                <base-identicon class="mr-3" size="20" variant="darker" :uri="erc721.logoURI" />
                <strong class="mr-1">{{ erc721.symbol }}</strong> {{ erc721.name }}
            </div>
        </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-text>ERC1155</b-dropdown-text>
        <b-dropdown-item-button
            :disabled="chainId !== erc1155.chainId"
            :key="erc1155._id"
            v-for="erc1155 of erc1155s"
            @click="onTokenListItemClick(erc1155)"
        >
            <div class="d-flex align-items-center">
                <base-identicon class="mr-3" size="20" variant="darker" :uri="erc1155.logoURI" />
                {{ erc1155.name }}
            </div>
        </b-dropdown-item-button>
    </b-dropdown>
    <div v-else>
        <b-button to="/nft" variant="light" block>
            Create NFT Collection
            <i class="fas fa-chevron-right ml-2"></i>
        </b-button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import BaseIdenticon from '../BaseIdenticon.vue';
import type { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import type { IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { NFTVariant } from '@thxnetwork/common/lib/types';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        erc721s: 'erc721/all',
        erc1155s: 'erc1155/all',
    }),
})
export default class BaseDropdownSelectERC721 extends Vue {
    ChainId = ChainId;
    tokenList: TERC721[] = [];

    erc721s!: IERC721s;
    erc1155s!: IERC1155s;

    @Prop({ required: false }) nft!: TERC1155 | TERC721;
    @Prop() chainId!: ChainId;

    get hasNFTs() {
        return !!Object.values(this.erc721s).length || !!Object.values(this.erc1155s).length;
    }

    get token() {
        if (!this.nft) return;
        switch (this.nft.variant) {
            case NFTVariant.ERC721: {
                return this.erc721s[this.nft._id];
            }
            case NFTVariant.ERC1155: {
                return this.erc1155s[this.nft._id];
            }
        }
    }

    async mounted() {
        this.$store.dispatch('erc721/list').then(() => {
            for (const id in this.erc721s) {
                this.$store.dispatch('erc721/read', id);
            }
        });
        this.$store.dispatch('erc1155/list').then(() => {
            for (const id in this.erc1155s) {
                this.$store.dispatch('erc1155/read', id);
            }
        });
    }

    onTokenListItemClick(token: TERC721 | TERC1155 | null) {
        this.$emit('selected', token);
    }
}
</script>
