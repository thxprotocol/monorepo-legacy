<template>
    <base-modal @hidden="onHidden()" :error="error" :title="modalTitle" id="modalNFTCreate">
        <template #modal-body>
            <b-form-group label="Title">
                <b-form-input v-model="title" />
            </b-form-group>
            <b-form-group label="Description">
                <b-form-input v-model="description" />
            </b-form-group>
            <label>Properties</label>
            <b-card bg-variant="light">
                <b-form-group :key="key" v-for="(prop, key) of erc721.properties">
                    <template #label>
                        {{ prop.name }}
                        <a href="#" v-b-tooltip :title="prop.description">
                            <i class="fas fa-question-circle"></i>
                        </a>
                    </template>
                    <b-form-file
                        @change="onDescChange"
                        :data-key="key"
                        v-if="parsePropType(prop.propType) === 'image'"
                        accept="image/*"
                    />

                    <b-form-input
                        v-else
                        :type="parsePropType(prop.propType)"
                        v-model="prop.value"
                        required
                        :placeholder="`Provide a ${prop.propType} value in this field.`"
                    />
                </b-form-group>
            </b-card>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="loading || schemaHaveErrors"
                class="rounded-pill"
                @click="submit()"
                variant="primary"
                block
            >
                {{ modalTitle }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { IPool } from '@thxprotocol/dashboard/store/modules/pools';
import { TERC721, TERC721DefaultProp, TERC721Metadata } from '@thxprotocol/dashboard/types/erc721';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';
import { isValidUrl } from '@thxprotocol/dashboard/utils/url';

const PROPTYPE_MAP: { [key: string]: string } = {
    string: 'text',
    number: 'number',
    image: 'image',
    link: 'url',
};

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class ModalRewardCreate extends Vue {
    authUrl = process.env['VUE_APP_AUTH_URL'];
    docsUrl = process.env['VUE_APP_DOCS_URL'];
    loading = false;
    error = '';

    recipient = '';
    title = '';
    description = '';

    @Prop() pool!: IPool;
    @Prop() erc721!: TERC721;
    @Prop({ required: false }) metadata!: TERC721Metadata;

    get modalTitle() {
        return this.metadata ? 'Update NFT' : 'Create NFT';
    }

    get isSubmitDisabled() {
        return this.loading;
    }

    get isEditing() {
        return this.metadata ? true : false;
    }

    get schemaHaveErrors() {
        const result = this.erc721.properties.reduce((pre: any, cur: any) => {
            if (pre) {
                return pre;
            }

            return this.getPropValidation(cur.propType, cur.value || '');
        }, false);

        return !!result;
    }
    getPropValidation = (name: string, value: string) => {
        switch (name) {
            case 'link':
                if (value.length > 0) return isValidUrl(value);
                return null;
            default:
                return undefined;
        }
    };

    parsePropType(propType: string) {
        return PROPTYPE_MAP[propType];
    }

    async upload(file: File) {
        const publicUrl = await this.$store.dispatch('images/upload', file);
        return publicUrl;
    }

    async onDescChange(event: any) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this.erc721.properties[event.target.dataset['key']], 'value', publicUrl);
    }

    @Watch('metadata')
    onMetadataChange() {
        if (this.metadata) {
            this.title = this.metadata['title'];
            this.description = this.metadata['description'];
            this.erc721.properties.forEach((prop, index) => {
                prop.value = this.metadata.attributes[index].value;
            });
        }
    }

    onHidden() {
        this.title = '';
        this.description = '';
        this.$emit('hidden');
    }

    submit() {
        if (this.schemaHaveErrors) {
            return;
        }

        const attributes: { key: string; value: string | number | undefined }[] = [];

        this.erc721.properties.forEach((prop: TERC721DefaultProp) => {
            attributes.push({
                key: prop.name,
                value: prop.value,
            });
        });

        if (this.isEditing) {
            this.$store.dispatch('erc721/updateMetadata', {
                pool: this.pool,
                erc721: this.erc721,
                attributes,
                title: this.title,
                description: this.description,
                recipient: this.recipient.length ? this.recipient : undefined,
                id: this.metadata._id,
            });
        } else {
            this.$store.dispatch('erc721/createMetadata', {
                pool: this.pool,
                erc721: this.erc721,
                attributes,
                title: this.title,
                description: this.description,
                recipient: this.recipient.length ? this.recipient : undefined,
            });
        }

        this.$emit('success');
        this.$bvModal.hide('modalNFTCreate');
    }
}
</script>
