<template>
    <b-dropdown variant="link" class="dropdown-select" v-if="hasERC721s">
        <template #button-content>
            <div class="d-flex align-items-center" v-if="token && token.chainId === chainId">
                <base-identicon class="mr-3" :size="20" variant="darker" :uri="token.logoURI" />
                <strong class="mr-1">{{ token.symbol }}</strong> {{ token.name }}
            </div>
            <div v-else>Select an ERC721 token</div>
        </template>
        <b-dropdown-item-button @click="onTokenListItemClick(null)"> None </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item v-if="!hasERC721s"> No ERC721 contract selected </b-dropdown-item>
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
    </b-dropdown>
    <div v-else class="small">No NFT contracts available</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '../BaseIdenticon.vue';
import { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        erc721s: 'erc721/all',
    }),
})
export default class BaseDropdownSelectERC721 extends Vue {
    ChainId = ChainId;
    token: TERC721 | null = null;
    tokenList: TERC721[] = [];

    erc721s!: IERC721s;

    @Prop({ required: false }) erc721!: TERC721;
    @Prop() chainId!: ChainId;

    get hasERC721s() {
        return !!Object.values(this.erc721s).length;
    }

    async mounted() {
        if (this.erc721) {
            this.token = this.erc721;
        }
        this.$store.dispatch('erc721/list').then(() => {
            for (const id in this.erc721s) {
                this.$store.dispatch('erc721/read', id).then(() => {
                    const erc721 = this.erc721s[id] as unknown as TERC721;
                    if (!this.token && erc721.chainId === this.chainId) {
                        this.token = erc721;
                        this.$emit('selected', this.token);
                    }
                });
            }
        });
    }

    onTokenListItemClick(token: TERC721 | null) {
        this.token = token;
        this.$emit('selected', this.token);
    }
}
</script>
