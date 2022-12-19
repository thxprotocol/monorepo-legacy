<template>
    <base-modal @show="onShow" :loading="loading" :error="error" title="Upload images" id="modalNFTBulkCreate">
        <template #modal-body v-if="!loading">
            <label>Select image property</label>
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
                <label>Select image folder</label>
                <b-form-file
                    @change="onFolderSelected"
                    :data-key="selectedKey"
                    accept="image/*"
                    :directory="true"
                    :multiple="true"
                />
            </b-form-group>
            <b-form-group>
                <label>Name</label>
                <input class="form-control" v-model="name" required placeholder="" />
            </b-form-group>
            <b-form-group>
                <label>Description</label>
                <input class="form-control" v-model="description" required placeholder="" /> </b-form-group
            ><b-form-group>
                <label>External URL</label>
                <input class="form-control" v-model="external_url" required placeholder="" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="isSubmitDisabled" class="rounded-pill" @click="submit()" variant="primary" block>
                Upload Images
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
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
    external_url = '';

    loading = false;
    error = '';
    selectedProp: TERC721DefaultProp | null = null;
    selectedKey: number | null = null;
    files: FileList | null = null;

    @Prop() pool!: IPool;
    @Prop() erc721!: TERC721;

    onShow() {
        const imageProps = this.erc721.properties.filter((x) => x.propType === 'image');
        if (imageProps.length) {
            this.selectedProp = imageProps[0];
        }
    }

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

            for (let i = 0; i < this.files.length; i++) {
                let file = this.files.item(i);
                await this.$store.dispatch('erc721/uploadMultipleMetadataImages', {
                    pool: this.pool,
                    erc721: this.erc721,
                    propName: this.selectedProp.name,
                    file: file,
                    name: this.name,
                    description: this.description,
                    external_url: this.external_url,
                });
                this.$emit('success');
            }

            //this.$emit('success');
        } catch (err) {
            /* NO-OP */
        } finally {
            this.$bvModal.hide('modalNFTBulkCreate');
            this.loading = false;
            this.files = null;
            this.selectedProp = null;
            this.selectedKey = null;
        }
    }
}
</script>
