<template>
    <base-modal title="Import/export metadata" id="modalERC721MetadataCsv">
        <template #modal-body>
            <b-form-group label="Export metadata">
                <p>
                    Download a spreadsheet of your NFT metadata.
                    <b-link :disabled="isLoading" @click="downloadCsv()"> Export NFT Metadata </b-link>
                </p>
            </b-form-group>
            <b-form-group label="Import metadata">
                <b-form-file v-model="selectedFile" accept="text/csv" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button
                class="rounded-pill"
                :disabled="!selectedFile || isLoading"
                @click="uploadCsv()"
                variant="primary"
                block
            >
                Upload file
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TPool } from '@thxnetwork/types/interfaces';
import type { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class BaseModalErc721MetadataUploadCSV extends Vue {
    @Prop() pool!: TPool;
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
    }

    async uploadCsv() {
        try {
            this.isLoading = true;
            await this.$store.dispatch('erc721/uploadMetadataCSV', {
                pool: this.pool,
                erc721: this.erc721,
                file: this.selectedFile,
            });

            this.$emit('update');
        } catch (err) {
            throw err;
        } finally {
            this.isLoading = false;
            this.$bvModal.hide('modalNFTUploadMetadataCsv');
            this.selectedFile = null;
        }
    }
}
</script>
