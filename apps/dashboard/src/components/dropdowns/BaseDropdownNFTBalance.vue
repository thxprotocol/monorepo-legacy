<template>
    <div>
        <b-dropdown no-flip variant="link" class="dropdown-select">
            <template #button-content>
                <div v-if="!token">Select a token</div>
                <div v-if="token">
                    <img
                        v-if="token.metadata"
                        :src="token.metadata.imageUrl"
                        height="25"
                        class="rounded mr-3"
                        alt="Metadata image"
                    />
                    <span class="mr-auto"> #{{ token.tokenId }} - {{ token.metadata.name }}</span>
                </div>
            </template>
            <b-dropdown-group style="max-height: 320px; overflow-y: auto">
                <b-dropdown-item-button @click="onClickToken(null)">None</b-dropdown-item-button>
                <template v-for="list of tokens">
                    <b-dropdown-item-button v-for="(t, key) of list" :key="key" @click="onClickToken(t)">
                        <b-media>
                            <template #aside>
                                <img :src="t.metadata.imageUrl" width="35" class="rounded" alt="Metadata image" />
                            </template>
                            <strong>#{{ t.tokenId }} - {{ t.metadata.name }}</strong>
                            <div class="text-truncate w-100">{{ t.metadata.description }}</div>
                        </b-media>
                    </b-dropdown-item-button>
                </template>
                <b-dropdown-divider />
            </b-dropdown-group>
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { NFTVariant } from '@thxnetwork/common/enums';
import { IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        erc721Tokens: 'erc721/tokens',
        erc1155s: 'erc1155/all',
        erc1155Tokens: 'erc1155/tokens',
    }),
})
export default class BaseDropdownERC721Metadata extends Vue {
    format = format;
    erc721s!: IERC721s;
    erc721Totals!: { [erc721Id: string]: number };
    erc721Tokens!: { [erc721Id: string]: TERC721Token[] };
    erc1155s!: IERC1155s;
    erc1155Totals!: { [erc1155Id: string]: number };
    erc1155Tokens!: { [erc1155Id: string]: TERC1155Token[] };

    limit = 25;
    page = 1;
    query = '';

    @Prop({ required: true }) pool!: TPool;
    @Prop({ required: true }) nft!: TERC721 | TERC1155;
    @Prop() tokenId!: string;

    get token() {
        if (!this.tokenId || !this.nft || !this[`${this.nft.variant}Tokens`][this.nft._id]) return;
        return this[`${this.nft.variant}Tokens`][this.nft._id][this.tokenId];
    }

    get tokens() {
        switch (this.nft.variant) {
            case NFTVariant.ERC721: {
                return this.erc721Tokens;
            }
            case NFTVariant.ERC1155: {
                return this.erc1155Tokens;
            }
        }
    }

    mounted() {
        this.listTokens();
    }

    @Watch('nft')
    listTokens() {
        this.$store.dispatch(this.nft.variant + '/listTokens', this.pool);
    }

    async onChangePage(page: number) {
        this.page = page;
        this.listTokens();
    }

    async onSearch(query: string) {
        this.query = query;
        this.listTokens();
    }

    async onClickToken(token: TERC721Token | TERC1155Token | null) {
        if (!this.nft || !this.tokens) return;
        if ((token as TERC1155Token).erc1155Id) {
            await this.$store.dispatch('erc1155/getToken', token);
        }
        this.$emit('selected', token ? this.tokens[this.nft._id as string][token._id] : null);
    }
}
</script>
