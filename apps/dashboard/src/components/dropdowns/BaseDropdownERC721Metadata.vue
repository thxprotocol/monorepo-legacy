<template>
    <div>
        <b-button v-if="!erc721metadataByPage.length" variant="light" :to="`/nft/${erc721._id}/metadata`" block>
            Create Metadata
        </b-button>
        <b-dropdown v-else no-flip variant="link" class="dropdown-select">
            <template #button-content>
                <img
                    v-if="selectedImageUrl"
                    :src="selectedImageUrl"
                    height="25"
                    class="rounded mr-3"
                    alt="Metadata image"
                />
                <span class="mr-auto">{{ selectedTitle }}</span>
            </template>
            <b-dropdown-group style="max-height: 320px; overflow-y: auto">
                <b-dropdown-item-button
                    v-for="metadata of erc721metadataByPage"
                    :key="metadata._id"
                    @click="onClick(metadata)"
                >
                    <small class="text-muted float-right">
                        {{ format(new Date(metadata.createdAt), 'dd-MM-yyyy HH:mm') }}
                    </small>
                    <div class="d-flex align-items-center">
                        <img :src="metadata.imageUrl" height="25" class="rounded mr-3" alt="Metadata image" />
                        <div>
                            <strong>{{ metadata.name }}</strong>
                            <br />
                            <div class="text-truncate-75">{{ metadata.description }}</div>
                        </div>
                    </div>
                </b-dropdown-item-button>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-form>
                    <b-pagination
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
import type { IERC721Metadatas, IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import type { TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        metadata: 'erc721/metadata',
        totals: 'erc721/totalsMetadata',
    }),
})
export default class BaseDropdownERC721Metadata extends Vue {
    format = format;
    erc721s!: IERC721s;
    metadata!: IERC721Metadatas;
    limit = 25;
    page = 1;
    query = '';

    totals!: { [erc721Id: string]: number };

    @Prop({ required: true }) erc721!: TERC721;
    @Prop({ required: false }) erc721metadataId!: string;

    get total() {
        return this.totals[this.erc721._id];
    }

    get selectedTitle() {
        if (!this.erc721metadataId) return 'None';
        const metadata = this.metadata[this.erc721._id][this.erc721metadataId];
        if (!metadata) return;
        return metadata.name;
    }

    get selectedImageUrl() {
        if (!this.erc721metadataId) return;
        const metadata = this.metadata[this.erc721._id][this.erc721metadataId];
        if (!metadata) return;
        return metadata.imageUrl;
    }

    get erc721metadataByPage() {
        if (this.erc721 && !this.metadata[this.erc721._id]) return [];

        return (
            this.erc721 &&
            this.metadata[this.erc721._id] &&
            Object.values(this.metadata[this.erc721._id])
                .filter((m) => m.page === this.page)
                .slice(0, this.limit)
        );
    }

    mounted() {
        this.searchMetadata();
    }

    async searchMetadata() {
        await this.$store.dispatch('erc721/searchMetadata', {
            erc721: this.erc721,
            page: this.page,
            limit: this.limit,
            query: this.query,
        });
    }

    async onChangePage(page: number) {
        this.page = page;
        await this.searchMetadata();
    }

    async onSearch(query: string) {
        this.query = query;
        await this.searchMetadata();
    }

    onClick(metadata: TERC721Metadata) {
        this.$emit('selected', metadata);
    }
}
</script>
