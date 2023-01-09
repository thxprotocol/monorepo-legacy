<template>
    <base-modal @show="onShow" :error="error" :title="metadata ? 'Update metadata' : 'Create metadata'" :id="id">
        <template #modal-body>
            <b-form-group :key="key" v-for="(prop, key) of erc721.properties">
                <template #label>
                    {{ prop.name }}
                    <a href="#" v-b-tooltip :title="prop.description">
                        <i class="fas fa-question-circle"></i>
                    </a>
                </template>
                <template v-if="parsePropType(prop.propType) === 'image'">
                    <b-row>
                        <b-col md="2" v-if="prop.value && prop.value.length">
                            <b-spinner v-if="imgLoading == key.toString()" variant="primary"></b-spinner>
                            <img v-else :src="prop.value" width="100%" />
                        </b-col>
                        <b-col md="2" v-else>
                            <b-spinner v-if="imgLoading == key.toString()" variant="primary"></b-spinner>
                        </b-col>
                        <b-col md="10">
                            <b-form-file
                                @change="onFileChange"
                                :data-key="key"
                                accept="image/*"
                                width="50%"
                                :placeholder="
                                    !metadata || !prop.value
                                        ? 'Browse to upload the image'
                                        : 'Browse to change the image...'
                                "
                                :disabled="imgLoading == key.toString()"
                            />
                        </b-col>
                    </b-row>
                </template>
                <b-form-input
                    v-else
                    :type="parsePropType(prop.propType)"
                    v-model="prop.value"
                    required
                    :placeholder="`Provide a ${prop.propType} value in this field.`"
                />
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
import type { TERC721, TERC721DefaultProp, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

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
    error = '';
    isSubmitDisabled = false;
    title = '';
    description = '';
    imgLoading = '';

    @Prop() id!: string;
    @Prop() erc721!: TERC721;
    @Prop({ required: false }) metadata!: TERC721Metadata;

    parsePropType(propType: string) {
        return PROPTYPE_MAP[propType];
    }

    async onFileChange(event: any) {
        this.imgLoading = event.target.dataset.key;
        this.isSubmitDisabled = true;
        const publicUrl = await this.$store.dispatch('images/upload', event.target.files[0]);
        Vue.set(this.erc721.properties[event.target.dataset['key']], 'value', publicUrl);
        this.isSubmitDisabled = false;
        this.imgLoading = '';
    }

    onShow() {
        if (this.metadata) {
            this.erc721.properties.forEach((prop, index) => {
                this.metadata.attributes.forEach((attr) => {
                    if (prop.name === attr.key) {
                        Vue.set(this.erc721.properties[index], 'value', attr.value);
                    }
                });
            });
        } else {
            this.erc721.properties.forEach((prop) => {
                prop.value = '';
            });
        }
    }

    submit() {
        const attributes: { key: string; value: string | number | undefined }[] = [];

        this.erc721.properties.forEach((prop: TERC721DefaultProp) => {
            if (prop.propType == 'image' && (!prop.value || !prop.value.length)) {
                return;
            }
            attributes.push({
                key: prop.name,
                value: prop.value,
            });
        });

        this.$store.dispatch(`erc721/${this.metadata ? 'updateMetadata' : 'createMetadata'}`, {
            erc721: this.erc721,
            metadata: {
                ...this.metadata,
                ...{
                    title: this.title,
                    description: this.description,
                    attributes,
                },
            },
        });
        this.$emit('update');
        this.$bvModal.hide(this.id);
    }
}
</script>
