<template>
    <base-modal @show="onShow" :error="error" :title="metadata ? 'Update metadata' : 'Create metadata'" :id="id">
        <template #modal-body>
            <b-form-group label="Name">
                <b-form-input v-model="name" required />
            </b-form-group>
            <b-form-group label="Description">
                <b-form-input v-model="description" required />
            </b-form-group>
            <b-form-group label="Image">
                <b-input-group>
                    <template #prepend>
                        <b-spinner v-if="isSubmitImage" variant="primary"></b-spinner>
                        <img v-else :src="imageUrl" width="100%" />
                    </template>
                    <b-form-file @change="onFileChange" accept="image/*" width="50%" :disabled="isSubmitImage" />
                </b-input-group>
            </b-form-group>
            <b-form-group label="External URL">
                <b-form-input v-model="externalUrl" required />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="isSubmitDisabled" class="rounded-pill" @click="submit()" variant="primary" block>
                {{ metadata ? 'Update Metadata' : 'Create metadata' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
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
    image = '';

    @Prop() id!: string;
    @Prop() erc721!: TERC721;
    @Prop({ required: false }) metadata!: TERC721Metadata;

    async onFileChange(event: any) {
        this.isSubmitImage = true;
        this.image = await this.$store.dispatch('images/upload', event.target.files[0]);
        this.isSubmitImage = false;
    }

    onShow() {
        this.name = this.metadata ? this.metadata.name : this.name;
        this.image = this.metadata ? this.metadata.image : this.image;
        this.description = this.metadata ? this.metadata.description : this.description;
        this.externalUrl = this.metadata ? this.metadata.externalUrl : this.externalUrl;
    }

    async submit() {
        await this.$store.dispatch(`erc721/${this.metadata ? 'updateMetadata' : 'createMetadata'}`, {
            erc721: this.erc721,
            metadata: {
                ...this.metadata,
                name: this.name,
                description: this.description,
                externalUrl: this.externalUrl,
                image: this.image,
            },
        });
        this.$emit('update');
        this.$bvModal.hide(this.id);
    }
}
</script>
