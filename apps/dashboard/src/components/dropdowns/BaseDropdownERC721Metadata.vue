<template>
    <div>
        <b-button v-if="!erc721metadataByPage.length" variant="light" :to="`/nft/${erc721._id}/metadata`" block>
            Create Metadata
        </b-button>
        <b-dropdown v-else no-flip variant="link" class="dropdown-select">
            <template #button-content>
                {{ selectedTitle }}
            </template>
            <b-dropdown-group style="max-height: 320px; overflow-y: auto">
                <b-dropdown-item-button
                    v-for="metadata of erc721metadataByPage"
                    :key="metadata._id"
                    @click="onClick(metadata)"
                >
                    <div class="d-flex justify-content-between">
                        <div>
                            <b-badge
                                :key="key"
                                v-for="(value, key) in metadata.attributes"
                                variant="dark"
                                v-b-tooltip
                                :title="value.value"
                                class="mr-2"
                            >
                                {{ value.key }}
                            </b-badge>
                        </div>
                        <small class="text-muted">
                            {{ format(new Date(metadata.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </div>
                </b-dropdown-item-button>
            </b-dropdown-group>
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
    limit = 5;
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
        return metadata.attributes.find((attr) => attr.key === 'name')?.value;
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
<style lang="scss">
.dropdown-menu {
    background-color: #f8f9fa;
}
#formRewardPointsCreate .dropdown-select .dropdown-menu {
    overflow-y: hidden;
    max-height: none !important;
}
</style>
