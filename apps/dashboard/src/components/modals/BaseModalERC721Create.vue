<template>
    <base-modal :loading="loading" :error="error" title="Create an NFT collection" id="modalERC721Create">
        <template #modal-body v-if="!loading">
            <base-form-select-network @selected="chainId = $event" />
            <b-row>
                <b-col>
                    <b-form-group>
                        <label>Title</label>
                        <b-form-input v-model="name" placeholder="Planets of the Galaxy" />
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group>
                        <label>Symbol</label>
                        <b-form-input v-model="symbol" placeholder="GLXY" />
                    </b-form-group>
                </b-col>
            </b-row>
            <b-form-group>
                <label>Description</label>
                <b-form-textarea v-model="description" placeholder="To infinity and beyond!" />
            </b-form-group>
            <b-row>
                <b-col>
                    <template>
                        <label>Token Icon</label>
                        <b-form-group>
                            <div class="col-md-2" v-if="imgLoading && imgLoading.length">
                                <b-spinner v-if="!image.length" variant="primary"></b-spinner>
                            </div>
                            <div class="col-md-2 float-left" v-else>
                                <img :src="image" width="100%" />
                            </div>
                            <b-form-file
                                @change="onFileChange"
                                class="col-md-10 float-left"
                                :data-key="image"
                                accept="image/*"
                                :placeholder="!image ? 'Browse to upload the image' : 'Browse to change the image...'"
                            />
                        </b-form-group>
                    </template>
                </b-col>
            </b-row>
            <b-form-group>
                <template #label>
                    Properties

                    <i
                        class="fas fa-question-circle text-gray"
                        v-b-tooltip
                        title="Items in an NFT collection are structured with properties. Here you should configure the available
                    properties within your collection."
                    ></i>
                </template>
                <BaseCardERC721DefaultPropertyConfig
                    v-for="(prop, key) in schema"
                    :key="key"
                    :prop="prop"
                    @deleted="$delete(schema, key)"
                    @changed="$set(schema, key, $event)"
                    class="mb-3"
                />
                <b-alert variant="warning" show v-if="variant === ERC721Variant.OpenSea">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <strong>Support of Open Sea attributes is currently in active development.</strong>
                    You will be able to add custom attributes after creating a collection, so feel free to go ahead with
                    the defaults.
                </b-alert>
                <b-button
                    block
                    @click="
                        schema.push({
                            name: '',
                            propType: 'string',
                            description: '',
                        })
                    "
                    variant="light"
                    class="rounded-pill"
                >
                    <i class="fas fa-plus"></i>
                    Add property
                </b-button>
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
                Create NFT collection
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { ERC721Variant, TERC721, TERC721DefaultProp } from '@thxnetwork/dashboard/types/erc721';
import { Component, Vue } from 'vue-property-decorator';
import BaseCardERC721DefaultPropertyConfig from '../cards/BaseCardERC721DefaultPropertyConfig.vue';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
        BaseCardERC721DefaultPropertyConfig,
        BaseFormSelectNetwork,
    },
})
export default class ModalERC721Create extends Vue {
    ERC721Variant = ERC721Variant;
    loading = false;
    error = '';
    variant = ERC721Variant.OpenSea;
    tokenList: TERC721[] = [];
    chainId: ChainId = ChainId.PolygonMumbai;
    erc721Token: TERC721 | null = null;
    name = '';
    symbol = '';
    description = '';
    defaultSchema = [
        {
            name: 'description',
            propType: 'string',
            description: 'A brief description of your item.',
            disabled: true,
        },
        {
            name: 'external_url',
            propType: 'link',
            description: 'A link referencing to a page with more information on the item.',
            disabled: true,
        },
        {
            name: 'image',
            propType: 'image',
            description: 'A visual representation of the item.',
            disabled: true,
        },
        {
            name: 'name',
            propType: 'string',
            description: 'The name of this item.',
            disabled: true,
        },
    ];
    schema: TERC721DefaultProp[] = this.defaultSchema;
    image = '';
    imgLoading = '';

    async submit() {
        this.loading = true;

        const data = {
            chainId: this.chainId,
            name: this.name,
            symbol: this.symbol,
            description: this.description,
            schema: this.schema,
            logoImgUrl: this.image,
        };

        await this.$store.dispatch('erc721/create', data);

        this.$bvModal.hide(`modalERC721Create`);
        this.image = '';
        this.imgLoading = '';
        this.name = '';
        this.symbol = '';
        this.loading = false;
        this.description = '';
        this.schema = this.defaultSchema;
    }

    async onFileChange(event: any) {
        const file = event.target.files[0];
        this.imgLoading = file.name;
        const publicUrl = await this.$store.dispatch('images/upload', {
            file,
            folder: this.symbol,
        });
        this.image = publicUrl;
        this.imgLoading = '';
    }
}
</script>
<style lang="scss"></style>
