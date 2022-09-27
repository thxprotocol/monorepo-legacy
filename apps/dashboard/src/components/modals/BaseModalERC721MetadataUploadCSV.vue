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
        <base-modal title="Download / Upload CSV" id="modalNFTUploadMetadataCsv">
            <template #btn-primary>
                <div style="padding: 1em; width: 100%">
                    <b-card :loading="isLoading">
                        <label>Download CSV schema</label>
                        <b-button
                            class="rounded-pill"
                            :disabled="isLoading"
                            @click="downloadCsv()"
                            variant="primary"
                            block
                        >
                            Download CSV
                        </b-button>
                    </b-card>
                </div>
                <div style="padding: 1em; width: 100%; text-align: center">AND</div>
                <div style="padding: 1em; width: 100%">
                    <b-card :loading="isLoading">
                        <label>Upload Edited CSV</label>
                        <b-form-group>
                            <b-form-file v-model="selectedFile" accept="text/csv" />
                        </b-form-group>
                        <b-button
                            class="rounded-pill"
                            :disabled="!selectedFile || isLoading"
                            @click="uploadCsv()"
                            variant="primary"
                            block
                        >
                            Upload CSV
                        </b-button>
                    </b-card>
                </div>
            </template>
        </base-modal>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class ModalERC721MetadataCreateCSV extends Vue {
    @Prop() pool!: IPool;
    @Prop() erc721!: TERC721;

    selectedFile: File | null = null;
    isLoading = false;

    async downloadCsv() {
        this.isLoading = true;
        await this.$store.dispatch('erc721/createMetadataCSV', {
            pool: this.pool,
            erc721: this.erc721,
        });
        this.isLoading = false;
        this.$bvModal.hide('modalNFTUploadMetadataCsv');
    }

    async uploadCsv() {
        try {
            this.isLoading = true;
            await this.$store.dispatch('erc721/uploadMetadataCSV', {
                pool: this.pool,
                erc721: this.erc721,
                file: this.selectedFile,
            });
            this.$emit('success');
            this.isLoading = false;
            this.$bvModal.hide('modalNFTUploadMetadataCsv');
        } catch (err) {
            this.isLoading = false;
            this.$bvModal.hide('modalNFTUploadMetadataCsv');
        }
    }
}
</script>
