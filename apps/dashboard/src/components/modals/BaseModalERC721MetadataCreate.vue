<template>
    <base-modal @show="onShow" :error="error" :title="metadata ? 'Update metadata' : 'Create metadata'" :id="id">
        <template #modal-body>
            <b-alert v-if="isLocked" variant="warning" show>
                This metadata is used by minted tokens and can no longer be changed.
            </b-alert>
            <b-form-group label="Name">
                <b-form-input :disabled="isLocked" v-model="name" required />
            </b-form-group>
            <b-form-group label="Description">
                <b-form-input :disabled="isLocked" v-model="description" required />
            </b-form-group>
            <b-form-group label="Image">
                <b-input-group>
                    <template #prepend>
                        <b-spinner v-if="isSubmitImage" variant="primary"></b-spinner>
                        <img v-else-if="imageUrl" :src="imageUrl" width="100" alt="Metadata image" />
                    </template>
                    <b-form-file
                        :disabled="isLocked || isSubmitImage"
                        @change="onFileChange"
                        accept="image/*"
                        width="50%"
                    />
                </b-input-group>
            </b-form-group>
            <b-form-group label="External URL">
                <b-form-input :disabled="isLocked" v-model="externalUrl" required />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isLocked || isSubmitDisabled"
                class="rounded-pill"
                @click="onClickSubmit"
                variant="primary"
                block
            >
                {{ metadata ? 'Update Metadata' : 'Create metadata' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TERC721, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import type { TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class ModalRewardCreate extends Vue {
    authUrl = process.env['VUE_APP_AUTH_URL'];
    docsUrl = process.env['VUE_APP_DOCS_URL'];
    error = '';
    isSubmitDisabled = false;
    isSubmitImage = false;

    name = '';
    description = '';
    externalUrl = '';
    imageUrl = '';

    @Prop() id!: string;
    @Prop() nft!: TERC721 | TERC1155;
    @Prop({ required: false }) metadata!: TNFTMetadata;

    get isLocked() {
        return this.metadata && !!this.metadata.tokens.length;
    }

    async onFileChange(event: any) {
        this.isSubmitImage = true;
        this.imageUrl = await this.$store.dispatch('images/upload', event.target.files[0]);
        this.isSubmitImage = false;
    }

    onShow() {
        this.name = this.metadata ? this.metadata.name : this.name;
        this.imageUrl = this.metadata ? this.metadata.imageUrl : this.imageUrl;
        this.description = this.metadata ? this.metadata.description : this.description;
        this.externalUrl = this.metadata ? this.metadata.externalUrl : this.externalUrl;
        this.error = '';
    }

    async onClickSubmit() {
        try {
            this.isSubmitDisabled = true;
            await this.$store.dispatch(
                `${this.$route.params.variant}/${this.metadata ? 'updateMetadata' : 'createMetadata'}`,
                {
                    erc721: this.nft,
                    erc1155: this.nft,
                    metadata: {
                        ...this.metadata,
                        name: this.name,
                        description: this.description,
                        imageUrl: this.imageUrl,
                        ...(this.externalUrl && { externalUrl: this.externalUrl }),
                    },
                },
            );
            this.$emit('update');
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = String(error);
            this.isSubmitDisabled = false;
        }
    }
}
</script>
