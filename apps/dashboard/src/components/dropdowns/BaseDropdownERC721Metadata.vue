<template>
    <b-dropdown variant="link" class="dropdown-select">
        <template #button-content>{{
            selectedMetadata ? selectedMetadata.title || '&nbsp;' : 'Select the NFT to Mint'
        }}</template>
        <b-dropdown-form>
            <b-form-input class="mb-2" placeholder="Search..." @input="onSearch" v-model="query" />
        </b-dropdown-form>
        <div style="height: 250px; overflow-y: scroll">
            <b-dropdown-item-button v-for="metadata of erc721metadata" :key="metadata._id" @click="onClick(metadata)">
                <div class="d-flex justify-content-between">
                    <div>{{ metadata.title }}</div>
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
        </div>
        <b-dropdown-form>
            <b-pagination
                v-if="total > limit"
                class="mt-3"
                @change="onChangePage"
                v-model="page"
                :per-page="limit"
                :total-rows="total"
                align="center"
            ></b-pagination>
        </b-dropdown-form>
    </b-dropdown>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import type { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import type { TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        total: 'erc721/totalsMetadata',
    }),
})
export default class BaseDropdownERC721Metadata extends Vue {
    format = format;
    erc721s!: IERC721s;
    selectedMetadata: TERC721Metadata | null = null;
    limit = 25;
    page = 1;
    query = '';

    total!: number;

    get erc721(): TERC721 {
        return this.erc721s[this.pool.erc721._id];
    }

    get erc721metadata() {
        return (
            this.erc721 &&
            Object.values(this.erc721.metadata).filter((m) => m.page === this.page && m.title.includes(this.query))
        );
    }

    @Prop() pool!: IPool;
    @Prop({ required: false }) erc721metadataId!: string;

    mounted() {
        if (this.erc721metadataId) {
            this.selectedMetadata = this.erc721metadata.find((m) => m._id === this.erc721metadataId) as TERC721Metadata;
        }
        this.searchMetadata();
    }

    async searchMetadata() {
        await this.$store.dispatch('erc721/searchMetadata', {
            erc721: this.pool.erc721,
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
        this.selectedMetadata = metadata;
        this.$emit('selected', metadata);
    }
}
</script>
<style lang="scss">
.dropdown-menu {
    background-color: #f8f9fa;
}
</style>
