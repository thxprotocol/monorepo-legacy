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
            <div class="mr-2 d-flex align-items-center font-weight-bold text-gray">{{ amount }} x</div>
            <div class="d-flex mr-2 rounded bg-gray text-white p-2" :id="`tooltip-target-${metadataId}-${index}`">
                <i class="fas fa-photo-video"></i>
            </div>
            <p style="line-height: 1" class="text-gray m-0">
                <strong>{{ metadata.name }}</strong>
                <b-link :href="metadata.externalUrl" target="_blank" class="ml-2 text-gray">
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                </b-link>
                <br />
                <span v-if="metadata.description">{{ metadata.description.substring(0, 25) }}... </span>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { IERC1155Metadatas, IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { IERC721Metadatas, IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { NFTVariant } from '@thxnetwork/types/enums';
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
