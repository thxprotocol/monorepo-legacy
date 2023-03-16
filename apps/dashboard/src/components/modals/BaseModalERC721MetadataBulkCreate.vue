<template>
    <base-modal
        @show="onShow"
        :loading="loading"
        :error="error"
        title="Upload images"
        id="modalERC721MetadataBulkCreate"
    >
        <template #modal-body v-if="!loading">
            <p class="text-muted">
                Select a folder containing the images for your NFT collection. We will create a metadata object for
                every image in that folder.
            </p>
            <b-form-group>
                <label>Image folder</label>
                <b-form-file @change="onFolderSelected" accept="image/*" :directory="true" :multiple="true" />
            </b-form-group>
            <hr />
            <b-card class="bg-light">
                <p class="text-muted">
                    Provide default metadata values for other properties when creating metadata for every uploaded
                    image.
                </p>
                <b-form-group>
                    <label>Name</label>
                    <input class="form-control" v-model="name" required placeholder="" />
                </b-form-group>
                <b-form-group>
                    <label>Description</label>
                    <input class="form-control" v-model="description" required placeholder="" /> </b-form-group
                ><b-form-group>
                    <label>External URL</label>
                    <input class="form-control" v-model="externalUrl" required placeholder="" />
                </b-form-group>
            </b-card>
        </template>
        <template #btn-primary>
            <b-button :disabled="isSubmitDisabled" class="rounded-pill" @click="submit()" variant="primary" block>
                Upload Images
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';
import type { TERC721, TERC721DefaultProp } from '@thxnetwork/dashboard/types/erc721';
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
    name = '';
    description = '';
    externalUrl = '';
    loading = false;
    error = '';
    selectedProp: TERC721DefaultProp | null = null;
    selectedKey: number | null = null;
    files: FileList | null = null;

    get isSubmitDisabled() {
        return this.loading || !this.files;
    }

    @Prop() pool!: TPool;
    @Prop() erc721!: TERC721;

    onShow() {
        const imageProps = this.erc721.properties.filter((x) => x.propType === 'image');
        this.selectedProp = imageProps.length ? imageProps[0] : null;
        this.files = null;
        this.selectedKey = null;
    }

    async onFolderSelected(event: any) {
        this.files = event.target.files;
    }

    async submit() {
        if (!this.selectedProp || !this.files) return;

        this.loading = true;

        for (let i = 0; i < this.files.length; i++) {
            await this.$store.dispatch('erc721/uploadMultipleMetadataImages', {
                pool: this.pool,
                erc721: this.erc721,
                propName: 'image',
                file: this.files.item(i),
                name: this.name,
                description: this.description,
                externalUrl: this.externalUrl,
            });
        }

        this.$emit('update');
        this.$bvModal.hide('modalNFTBulkCreate');
        this.loading = false;
    }
}
</script>
