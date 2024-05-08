<template>
    <div>
        <b-button v-if="!metadataByPage" variant="light" :to="`/nft/${nft._id}/metadata`" block>
            Create Metadata
        </b-button>
        <b-dropdown v-else no-flip variant="link" class="dropdown-select">
            <template #button-content>
                <div v-if="!metadata">Select token or metadata</div>
                <div v-else>
                    <img
                        v-if="metadata"
                        :src="metadata.imageUrl"
                        height="25"
                        class="rounded mr-3"
                        alt="Metadata image"
                    />
                    <span class="mr-auto">{{ metadata.name }}</span>
                </div>
            </template>
            <b-dropdown-group style="max-height: 320px; overflow-y: auto">
                <b-dropdown-item-button @click="onClickMetadata(null)">None</b-dropdown-item-button>
                <b-dropdown-item-button v-for="m of metadataByPage" :key="m._id" @click="onClickMetadata(m)">
                    <b-media>
                        <template #aside>
                            <img :src="m.imageUrl" width="35" class="rounded" alt="Metadata image" />
                        </template>
                        <strong>{{ m.name }}</strong>
                        <br />
                        <div class="text-truncate" style="width: 230px">{{ m.description }}</div>
                    </b-media>
                </b-dropdown-item-button>
                <b-dropdown-divider />
                <b-dropdown-form>
                    <b-pagination
                        size="sm"
                        @change="onChangePage"
                        v-model="page"
                        :per-page="limit"
                        :total-rows="total"
                        align="center"
                    ></b-pagination>
                </b-dropdown-form>
            </b-dropdown-group>
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { NFTVariant } from '@thxnetwork/common/enums';

import type { IERC721Metadatas, IERC721s, TERC721, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import { IERC1155Metadatas, IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        erc721Metadata: 'erc721/metadata',
        erc721Totals: 'erc721/totalsMetadata',
        erc1155s: 'erc1155/all',
        erc1155Metadata: 'erc1155/metadata',
        erc1155Totals: 'erc1155/totalsMetadata',
    }),
})
export default class BaseDropdownERC721Metadata extends Vue {
    format = format;
    erc721s!: IERC721s;
    erc721Metadata!: IERC721Metadatas;
    erc721Totals!: { [erc721Id: string]: number };
    erc1155s!: IERC1155s;
    erc1155Metadata!: IERC1155Metadatas;
    erc1155Totals!: { [erc1155Id: string]: number };

    limit = 25;
    page = 1;
    query = '';

    @Prop({ required: true }) pool!: TPool;
    @Prop({ required: true }) nft!: TERC721 | TERC1155;
    @Prop() metadataId!: string;

    get total() {
        switch (this.nft.variant) {
            case NFTVariant.ERC721:
                return this.erc721Totals[this.nft._id];
            case NFTVariant.ERC1155:
                return this.erc1155Totals[this.nft._id];
        }
    }

    get metadata() {
        if (!this.metadataId) return;
        switch (this.nft.variant) {
            case NFTVariant.ERC721: {
                return this.erc721Metadata[this.nft._id] && this.erc721Metadata[this.nft._id][this.metadataId];
            }
            case NFTVariant.ERC1155: {
                return this.erc1155Metadata[this.nft._id] && this.erc1155Metadata[this.nft._id][this.metadataId];
            }
        }
    }

    get metadatas() {
        switch (this.nft.variant) {
            case NFTVariant.ERC721: {
                return this.erc721Metadata[this.nft._id] ? Object.values(this.erc721Metadata[this.nft._id]) : [];
            }
            case NFTVariant.ERC1155: {
                return this.erc1155Metadata[this.nft._id] ? Object.values(this.erc1155Metadata[this.nft._id]) : [];
            }
        }
    }

    get metadataByPage(): TNFTMetadata[] {
        return this.metadatas.filter((m) => m.page === this.page).slice(0, this.limit);
    }

    mounted() {
        this.searchMetadata();
    }

    @Watch('nft')
    searchMetadata() {
        this.$store.dispatch(this.nft.variant + '/searchMetadata', {
            erc721: this.nft,
            erc1155: this.nft,
            page: this.page,
            limit: this.limit,
            query: this.query,
        });
    }

    async onChangePage(page: number) {
        this.page = page;
        this.searchMetadata();
    }

    async onSearch(query: string) {
        this.query = query;
        this.searchMetadata();
    }

    onClickMetadata(metadata: TNFTMetadata | null) {
        this.$emit('selected', metadata);
    }
}
</script>
