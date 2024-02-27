<template>
    <div v-if="metadata">
        <b-tooltip :target="`tooltip-target-${metadataId}-${index}`" triggers="hover">
            <b-link :href="metadata.imageUrl" target="_blank" v-if="metadata.image">
                <img :src="metadata.imageUrl" class="mt-2 rounded" width="180" height="auto" />
            </b-link>
            <strong>{{ metadata.name }}</strong>
            {{ metadata.description }}
            <b-link :href="metadata.externalUrl" target="_blank">External URL</b-link>
        </b-tooltip>

        <div class="d-flex align-items-center">
            <div class="d-flex mr-2 rounded bg-gray text-white p-3" :id="`tooltip-target-${metadataId}-${index}`">
                <i class="fas fa-photo-video"></i>
            </div>
            <div class="text-gray" style="line-height: 1.3">
                <strong>
                    <span v-if="amount > 1">{{ amount }} x</span>
                    {{ metadata.name }}
                </strong>
                <b-link :href="metadata.externalUrl" target="_blank" class="ml-2 text-gray">
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                </b-link>
                <br />
                <div v-if="metadata.description" class="text-truncate">{{ metadata.description }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { IERC1155Metadatas, IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { IERC721Metadatas, IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { NFTVariant } from '@thxnetwork/common/enums';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

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
export default class BaseBadgeMetadataPreview extends Vue {
    erc721s!: IERC721s;
    erc721Metadata!: IERC721Metadatas;
    erc721Totals!: { [erc721Id: string]: number };
    erc1155s!: IERC1155s;
    erc1155Metadata!: IERC1155Metadatas;
    erc1155Totals!: { [erc1155Id: string]: number };

    @Prop() index!: number;
    @Prop() amount!: number;
    @Prop({ required: true }) nft!: TERC721 | TERC1155;
    @Prop({ required: true }) metadataId!: string;

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

    async mounted() {
        if (this.nft && !this.metadata) {
            await this.$store.dispatch(this.nft.variant + '/readMetadata', {
                erc721: this.nft,
                erc1155: this.nft,
                metadataId: this.metadataId,
            });
        }
    }
}
</script>
