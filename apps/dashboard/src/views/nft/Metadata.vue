<template>
    <div v-if="erc721">
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">NFT Metadata</h2>
            </b-col>
            <b-dropdown variant="light" dropleft no-caret size="sm" class="ml-2">
                <template #button-content>
                    <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" style="font-size: 1.2rem"></i>
                </template>
                <b-dropdown-item v-b-modal="'modalERC721MetadataCreate'">
                    <i class="fas fa-plus mr-2"></i>
                    Create Metadata
                </b-dropdown-item>
                <b-dropdown-item v-b-modal="'modalERC721MetadataBulkCreate'">
                    <i class="fas fa-upload mr-2"></i>
                    Upload Images
                </b-dropdown-item>
                <b-dropdown-item v-b-modal="'modalERC721MetadataCsv'">
                    <i class="fas fa-exchange-alt mr-2"></i>
                    Import/Export
                </b-dropdown-item>
            </b-dropdown>
            <base-modal-erc721-metadata-create @update="listMetadata" id="modalERC721MetadataCreate" :erc721="erc721" />
            <BaseModalErc721MetadataBulkCreate :erc721="erc721" />
            <BaseModalErc721MetadataUploadCSV :erc721="erc721" />
        </b-row>

        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :total-rows="totals[erc721._id]"
                :selectedItems="selectedItems"
                :actions="[
                    { variant: 0, label: `Delete metadata` },
                    { variant: 1, label: `Create perk` },
                ]"
                @click-action="onClickAction"
                @change-limit="onChangeLimit"
                @change-page="onChangePage"
            />
            <b-alert variant="success" show v-if="isDownloadScheduled">
                <i class="fas fa-clock mr-2"></i>
                You will receive an e-mail when your download is ready!
            </b-alert>
            <b-alert variant="info" show v-if="isDownloading">
                <i class="fas fa-hourglass-half mr-2"></i>
                Downloading your QR codes
            </b-alert>
            <BaseModalRewardERC721Create
                id="modalRewardERC721Create"
                :erc721SelectedMetadataIds="selectedItems"
                :erc721="erc721"
            />
            <BTable hover :busy="isLoading" :items="metadataByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onSelectAll" />
                </template>
                <template #head(created)> Created </template>
                <template #head(attributes)> Attributes </template>
                <template #head(tokens)> Tokens </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(created)="{ item }">
                    {{ format(new Date(item.created), 'dd-MM-yyyy HH:mm') }}
                </template>
                <template #cell(attributes)="{ item }">
                    <b-badge
                        :key="key"
                        v-for="(atribute, key) in item.attributes"
                        variant="dark"
                        v-b-tooltip
                        :title="atribute.value"
                        class="mr-2"
                    >
                        {{ atribute.key }}
                    </b-badge>
                </template>
                <template #cell(tokens)="{ item }">
                    <b-badge
                        class="mr-2"
                        variant="dark"
                        :key="token.tokenId"
                        v-for="token of item.tokens"
                        v-b-tooltip
                        :title="`Minted at: ${format(new Date(token.createdAt), 'dd-MM-yyyy HH:mm')}`"
                    >
                        #{{ token.tokenId }}
                    </b-badge>
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown no-caret size="sm" variant="link">
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item
                            :disabled="!!item.tokens.length"
                            v-b-modal="'modalERC721MetadataCreate' + item.id"
                        >
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item target="_blank" v-bind:href="`${apiUrl}/v1/metadata/${item.id}`">
                            View JSON
                        </b-dropdown-item>
                        <b-dropdown-item
                            :disabled="!!item.tokens.length"
                            @click="onClickDelete(erc721.metadata[item.id])"
                        >
                            Delete
                        </b-dropdown-item>
                        <base-modal-erc721-metadata-create
                            @update="listMetadata"
                            :id="`modalERC721MetadataCreate${item.id}`"
                            :erc721="erc721"
                            :metadata="erc721.metadata[item.id]"
                        />
                    </b-dropdown>
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { format } from 'date-fns';
import { IPool, IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { IERC721s, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BaseCardErc721Metadata from '@thxnetwork/dashboard/components/cards/BaseCardERC721Metadata.vue';
import BaseModalErc721MetadataCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataCreate.vue';
import BaseModalErc721MetadataBulkCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataBulkCreate.vue';
import BaseModalErc721MetadataUploadCSV from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataUploadCSV.vue';
import BaseModalErc721MetadataCreateCSV from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataCreateCSV.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';

@Component({
    components: {
        BaseNothingHere,
        BaseCardErc721Metadata,
        BaseModalErc721MetadataCreate,
        BaseModalErc721MetadataBulkCreate,
        BaseModalErc721MetadataUploadCSV,
        BaseModalErc721MetadataCreateCSV,
        BaseCardTableHeader,
        BaseModalRewardERC721Create,
    },
    computed: mapGetters({
        pools: 'pools/all',
        erc721s: 'erc721/all',
        totals: 'erc721/totalsMetadata',
    }),
})
export default class MetadataView extends Vue {
    page = 1;
    limit = 5;
    isLoading = true;
    format = format;
    totals!: { [erc721Id: string]: number };
    docsUrl = process.env.VUE_APP_DOCS_URL;
    apiUrl = process.env.VUE_APP_API_ROOT;
    widgetUrl = process.env.VUE_APP_WIDGET_URL;
    qrURL = '';
    isDownloading = false;
    isDownloadScheduled = false;
    selectedItems: any[] = [];
    pools!: IPools;
    erc721s!: IERC721s;

    @Prop() erc721!: TERC721;

    get metadataByPage() {
        if (!this.erc721) return [];
        return Object.values(this.erc721s[this.erc721._id].metadata)
            .filter((metadata: TERC721Metadata) => metadata.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TERC721Metadata) => ({
                checkbox: r._id,
                created: r.createdAt,
                attributes: r.attributes,
                tokens: r.tokens,
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    async mounted() {
        this.listMetadata();
    }

    onChangePage(page: number) {
        this.page = page;
        this.listMetadata();
    }

    async onClickDelete(metadata: TERC721Metadata) {
        await this.$store.dispatch('erc721/deleteMetadata', {
            erc721: this.erc721,
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
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch('erc721/deleteMetadata', {
                        erc721: this.erc721,
                        metadata: this.erc721.metadata[id],
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
        await this.$store.dispatch('erc721/read', this.$route.params.erc721Id).then(async () => {
            await this.$store.dispatch('erc721/listMetadata', {
                erc721: this.erc721,
                page: this.page,
                limit: this.limit,
            });
        });
        this.isLoading = false;
    }
}
</script>
