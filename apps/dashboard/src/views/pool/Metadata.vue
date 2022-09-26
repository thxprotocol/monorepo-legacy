<template>
    <b-skeleton-wrapper :loading="isLoading">
        <template #loading>
            <b-card class="mt-3 mb-3 shadow-sm cursor-pointer">
                <b-skeleton animation="fade" width="65%"></b-skeleton>
                <hr />
                <b-skeleton animation="fade" width="55%"></b-skeleton>
                <b-skeleton animation="fade" class="mb-3" width="70%"></b-skeleton>
                <b-skeleton type="button" animation="fade" class="rounded-pill" width="100%"></b-skeleton>
            </b-card>
        </template>
        <div>
            <b-row class="mb-3">
                <b-col class="d-flex align-items-center">
                    <h2 class="mb-0">Metadata</h2>
                </b-col>
                <div class="d-flex justify-content-end">
                    <b-button @click="onCreate()" class="rounded-pill" variant="primary">
                        <i class="fas fa-plus mr-2"></i>
                        <span class="d-none d-md-inline">Create Metadata</span>
                    </b-button>
                    <b-button v-b-modal="'modalNFTBulkCreate'" class="rounded-pill ml-2" variant="primary">
                        <i class="fas fa-upload mr-2"></i>
                        <span class="d-none d-md-inline">Upload images</span>
                    </b-button>
                    <b-button v-b-modal="'modalNFTUploadMetadataCsv'" class="rounded-pill ml-2" variant="primary">
                        <i class="fas fa-upload mr-2"></i>
                        <span class="d-none d-md-inline">Upload CSV</span>
                    </b-button>
                </div>
            </b-row>
            <base-nothing-here
                v-if="erc721 && !erc721.metadata"
                text-submit="Create NFT Metadata"
                title="You have not created NFT Metadata yet"
                description="NFT Metadata is the actual data that is attached to your token."
                @clicked="$bvModal.show('modalNFTCreate')"
            />
            <base-card-erc721-metadata
                @edit="onEdit"
                v-if="erc721 && erc721.metadata"
                :erc721="erc721"
                :metadata="metadataByPage"
                :pool="pool"
            />
            <b-pagination
                v-if="erc721s && erc721 && erc721.metadata && total > limit"
                class="mt-3"
                @change="onChangePage"
                v-model="page"
                :per-page="limit"
                :total-rows="total"
                align="center"
            ></b-pagination>
            <base-modal-erc721-metadata-create
                v-if="erc721"
                @hidden="reset"
                :metadata="editingMeta"
                :pool="pool"
                :erc721="erc721"
                @success="listMetadata()"
            />
            <base-modal-erc721-metadata-bulk-create
                v-if="erc721"
                :pool="pool"
                :erc721="erc721"
                @success="listMetadata()"
            />
            <BaseModalErc721MetadataUploadCSV v-if="erc721" :pool="pool" :erc721="erc721" @success="onSuccess()" />
        </div>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import { IPool, IPools } from '@thxprotocol/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IERC721s, TERC721, TERC721Metadata } from '@thxprotocol/dashboard/types/erc721';
import BaseNothingHere from '@thxprotocol/dashboard/components/BaseListStateEmpty.vue';
import BaseCardErc721Metadata from '@thxprotocol/dashboard/components/cards/BaseCardERC721Metadata.vue';
import BaseModalErc721MetadataCreate from '@thxprotocol/dashboard/components/modals/BaseModalERC721MetadataCreate.vue';
import BaseModalErc721MetadataBulkCreate from '@thxprotocol/dashboard/components/modals/BaseModalERC721MetadataBulkCreate.vue';
import BaseModalErc721MetadataUploadCSV from '@thxprotocol/dashboard/components/modals/BaseModalERC721MetadataUploadCSV.vue';
import BaseModalErc721MetadataCreateCSV from '@thxprotocol/dashboard/components/modals/BaseModalERC721MetadataCreateCSV.vue';

@Component({
    components: {
        BaseNothingHere,
        BaseModalErc721MetadataCreate,
        BaseModalErc721MetadataBulkCreate,
        BaseCardErc721Metadata,
        BaseModalErc721MetadataUploadCSV,
        BaseModalErc721MetadataCreateCSV,
    },
    computed: mapGetters({
        pools: 'pools/all',
        erc721s: 'erc721/all',
        totals: 'erc721/totalsMetadata',
    }),
})
export default class MetadataView extends Vue {
    page = 1;
    limit = 100;
    isLoading = true;

    totals!: { [erc721Id: string]: number };

    docsUrl = process.env.VUE_APP_DOCS_URL;
    apiUrl = process.env.VUE_APP_API_ROOT;
    widgetUrl = process.env.VUE_APP_WIDGET_URL;

    pools!: IPools;
    erc721s!: IERC721s;
    editingMeta: TERC721Metadata | null = null;

    get pool(): IPool {
        return this.pools[this.$route.params.id];
    }

    get erc721(): TERC721 {
        return this.erc721s[this.pool.erc721Id];
    }

    get total() {
        return this.totals[this.erc721._id];
    }

    get metadataByPage() {
        if (!this.erc721s[this.erc721._id].metadata) return [];
        return Object.values(this.erc721s[this.erc721._id].metadata)
            .filter((metadata: TERC721Metadata) => metadata.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, this.limit);
    }

    onChangePage(page: number) {
        this.page = page;
        this.listMetadata();
    }

    reset() {
        Vue.set(this, 'editingMeta', null);
    }

    onEdit(metadata: TERC721Metadata) {
        Vue.set(this, 'editingMeta', metadata);
        this.$bvModal.show('modalNFTCreate');
    }

    onCreate() {
        this.reset();
        this.$bvModal.show('modalNFTCreate');
    }

    async listMetadata() {
        this.isLoading = true;
        await this.$store.dispatch('erc721/read', this.pool.erc721._id).then(async () => {
            await this.$store.dispatch('erc721/listMetadata', {
                erc721: this.erc721,
                page: this.page,
                limit: this.limit,
            });
        });
        this.isLoading = false;
    }

    async onSuccess() {
        await this.listMetadata();
        this.reset();
    }

    mounted() {
        this.listMetadata();
    }
}
</script>
