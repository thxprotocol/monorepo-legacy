<template>
    <div v-if="nft">
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center justify-content-between">
                <h2 class="mb-0">NFT Metadata</h2>
                <b-dropdown variant="primary" right no-caret size="sm" class="ml-auto">
                    <template #button-content>
                        <i class="fas fa-ellipsis-v m-0 p-1 px-2"></i>
                    </template>
                    <b-dropdown-item v-b-modal="'modalERC721MetadataCreate'">
                        <i class="fas fa-plus mr-2"></i>
                        Create Metadata
                    </b-dropdown-item>
                </b-dropdown>
                <BaseModalErc721MetadataCreate @update="listMetadata" id="modalERC721MetadataCreate" :nft="nft" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :total-rows="totals[nft._id]"
                :selectedItems="selectedItems"
                :actions="[{ variant: 0, label: `Delete metadata` }]"
                @click-action="onClickAction"
                @change-limit="onChangeLimit"
                @change-page="onChangePage"
            />
            <BTable hover :busy="isLoading" :items="metadataByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onSelectAll" />
                </template>
                <template #head(image)> Image </template>
                <template #head(info)> Details </template>
                <template #head(tokens)> Tokens </template>
                <template #head(created)> Created </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(image)="{ item }">
                    <img v-if="item.image" :src="item.image" height="40" alt="Metadata image" />
                </template>
                <template #cell(info)="{ item }">
                    <strong>{{ item.info.name }}</strong
                    ><br />
                    {{ item.info.description }}
                </template>
                <template #cell(created)="{ item }">
                    <small class="text-muted">{{ format(new Date(item.created), 'dd-MM-yyyy HH:mm') }}</small>
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown no-caret size="sm" right variant="link">
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalERC721MetadataCreate' + item.id"> Edit </b-dropdown-item>
                        <b-dropdown-item target="_blank" :href="getMetadataURL(metadata[item.id])">
                            Preview URI
                        </b-dropdown-item>
                        <b-dropdown-item v-if="nft && metadata" @click="onClickDelete(metadata[item.id])">
                            Delete
                        </b-dropdown-item>
                        <base-modal-erc721-metadata-create
                            @update="listMetadata"
                            :id="`modalERC721MetadataCreate${item.id}`"
                            :nft="nft"
                            :metadata="metadata ? metadata[item.id] : null"
                        />
                    </b-dropdown>
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { format } from 'date-fns';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { IERC721Metadatas, IERC721s, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import type { IERC1155Metadatas, IERC1155s } from '@thxnetwork/dashboard/types/erc1155';
import { NFTVariant } from '@thxnetwork/common/enums';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import BaseCardErc721Metadata from '@thxnetwork/dashboard/components/cards/BaseCardERC721Metadata.vue';
import BaseModalErc721MetadataCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataCreate.vue';
import BaseModalErc721MetadataBulkCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataBulkCreate.vue';
import BaseModalErc721MetadataUploadCSV from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataUploadCSV.vue';
import BaseModalErc721MetadataCreateCSV from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataCreateCSV.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';

@Component({
    components: {
        BaseCardErc721Metadata,
        BaseModalErc721MetadataCreate,
        BaseModalErc721MetadataBulkCreate,
        BaseModalErc721MetadataUploadCSV,
        BaseModalErc721MetadataCreateCSV,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        totals: 'erc721/totalsMetadata',
        erc721s: 'erc721/all',
        erc721Metadata: 'erc721/metadata',
        erc1155s: 'erc1155/all',
        erc1155Metadata: 'erc1155/metadata',
    }),
})
export default class MetadataView extends Vue {
    page = 1;
    limit = 5;
    isLoading = true;
    format = format;
    totals!: { [erc721Id: string]: number };
    docsUrl = process.env.VUE_APP_DOCS_URL;
    apiUrl = API_URL;
    widgetUrl = process.env.VUE_APP_WIDGET_URL;
    qrURL = '';
    selectedItems: any[] = [];
    erc721s!: IERC721s;
    erc1155s!: IERC1155s;
    erc721Metadata!: IERC721Metadatas;
    erc1155Metadata!: IERC1155Metadatas;

    get nft() {
        switch (this.$route.params.variant) {
            case NFTVariant.ERC721:
                if (!this.erc721s[this.$route.params.nftId]) return;
                return this.erc721s[this.$route.params.nftId];
            case NFTVariant.ERC1155:
                if (!this.erc1155s[this.$route.params.nftId]) return;
                return this.erc1155s[this.$route.params.nftId];
            default:
                return;
        }
    }

    get metadata() {
        switch (this.$route.params.variant) {
            case NFTVariant.ERC721:
                if (!this.erc721Metadata[this.$route.params.nftId]) return;
                return this.erc721Metadata[this.$route.params.nftId];
            case NFTVariant.ERC1155:
                if (!this.erc1155Metadata[this.$route.params.nftId]) return;
                return this.erc1155Metadata[this.$route.params.nftId];
            default:
                return;
        }
    }

    get metadataByPage() {
        if (!this.nft || !this.metadata) return [];
        return Object.values(this.metadata)
            .filter((metadata: TNFTMetadata) => metadata.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TNFTMetadata) => ({
                checkbox: r._id,
                image: r.imageUrl,
                info: { name: r.name, description: r.description, url: r.externalUrl },
                created: r.createdAt,
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    async mounted() {
        this.listMetadata();
    }

    getMetadataURL(metadata: TNFTMetadata) {
        switch (this.$route.params.variant) {
            case NFTVariant.ERC721:
                return `${this.apiUrl}/metadata/${metadata._id}`;
            case NFTVariant.ERC1155:
                return `${this.apiUrl}/metadata/erc1155/${this.nft?._id}/${metadata.tokenId}`;
        }
    }
    onChangePage(page: number) {
        this.page = page;
        this.listMetadata();
    }

    async onClickDelete(metadata: TNFTMetadata) {
        if (metadata.tokens.length) throw new Error('This metadata is being used.');
        await this.$store.dispatch(`${this.$route.params.variant}/deleteMetadata`, {
            erc721: this.nft,
            erc1155: this.nft,
            metadata,
        });
    }

    onSelectAll(isSelectAll: boolean) {
        this.selectedItems = isSelectAll ? (this.metadataByPage.map((r) => r.id) as string[]) : [];
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listMetadata();
    }

    onClickAction(action: { variant: number; label: string }) {
        if (!this.nft) return;
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch(`${this.$route.params.variant}/deleteMetadata`, {
                        erc721: this.nft,
                        erc1155: this.nft,
                        metadata: this.metadata && this.metadata[this.nft._id][id],
                    });
                }
                break;
            case 1:
                this.$bvModal.show('modalRewardERC721Create');
                break;
        }
    }

    async listMetadata() {
        this.isLoading = true;
        await this.$store.dispatch(this.$route.params.variant + '/read', this.$route.params.nftId);
        await this.$store.dispatch(this.$route.params.variant + '/listMetadata', {
            erc721: this.nft,
            erc1155: this.nft,
            page: this.page,
            limit: this.limit,
        });
        this.isLoading = false;
    }
}
</script>
