<template>
    <b-skeleton-wrapper :loading="loading">
        <template #loading>
            <b-form-group class="mb-0">
                <hr />
                <div class="row pt-2 pb-2">
                    <div class="col-md-4">
                        <b-skeleton animation="fade" width="85%"></b-skeleton>
                        <b-skeleton animation="fade" width="80%"></b-skeleton>
                    </div>
                    <div class="col-md-2">
                        <b-skeleton animation="fade" width="85%"></b-skeleton>
                        <b-skeleton animation="fade" width="80%"></b-skeleton>
                    </div>
                    <div class="col-md-2">
                        <b-skeleton animation="fade" width="85%"></b-skeleton>
                        <b-skeleton animation="fade" width="80%"></b-skeleton>
                    </div>
                    <div class="col-md-4 text-right d-flex justify-content-end">
                        <b-skeleton type="avatar" class="inline"></b-skeleton>
                        <b-skeleton type="avatar" class="inline ml-1"></b-skeleton>
                    </div>
                </div>
            </b-form-group>
        </template>

        <base-modal :error="error" title="Create Bulk NFTs" id="modalNFTBulkCreate">
            <template #modal-body>
                <label>Select Image Property</label>
                <b-card bg-variant="light">
                    <b-dropdown variant="link" class="dropdown-select">
                        <template #button-content>
                            <div v-if="selectedProp">
                                {{ selectedProp.name }}
                            </div>
                        </template>
                        <b-dropdown-item-button
                            v-for="(prop, key) of erc721.properties.filter((x) => x.propType === 'image')"
                            :key="key"
                            @click="onPropSelect(prop, key)"
                        >
                            {{ prop.name }}
                        </b-dropdown-item-button>
                    </b-dropdown>
                    <br />
                    <b-form-group v-if="selectedProp">
                        <label>Browse folder</label>
                        <b-form-file
                            @change="onFolderSelected"
                            :data-key="selectedKey"
                            accept="image/*"
                            :directory="true"
                            :multiple="true"
                        />
                    </b-form-group>
                </b-card>
            </template>
            <template #btn-primary>
                <b-button :disabled="isSubmitDisabled" class="rounded-pill" @click="submit()" variant="primary" block>
                    Create NFTs
                </b-button>
            </template>
        </base-modal>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { TERC721, TERC721DefaultProp } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class ModalERC721MetadataBulkCreate extends Vue {
    loading = false;
    error = '';
    selectedProp: TERC721DefaultProp | null = null;
    selectedKey: number | null = null;
    files: FileList | null = null;

    @Prop() pool!: IPool;
    @Prop() erc721!: TERC721;

    get isSubmitDisabled() {
        return this.loading || !this.files;
    }

    onPropSelect(prop: TERC721DefaultProp, key: number) {
        this.selectedProp = prop;
        this.selectedKey = key;
    }

    async onFolderSelected(event: any) {
        this.files = event.target.files;
    }

    async submit() {
        try {
            this.loading = true;
            if (!this.selectedProp || !this.files) {
                return;
            }

            await this.$store.dispatch('erc721/uploadMultipleMetadataImages', {
                pool: this.pool,
                erc721: this.erc721,
                propName: this.selectedProp.name,
                files: this.files,
            });

            this.$emit('success');
        } catch (err) {
            console.log('ERROR ON SUBMIT', err);
            /* NO-OP */
        } finally {
            this.$bvModal.hide('modalNFTBulkCreate');
            this.loading = false;
        }
    }
}
</script>
