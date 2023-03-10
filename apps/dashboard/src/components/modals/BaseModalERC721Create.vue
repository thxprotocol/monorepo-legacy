<template>
    <base-modal :loading="loading" :error="error" title="Create NFT collection" id="modalERC721Create">
        <template #modal-body v-if="!loading">
            <base-form-select-network @selected="chainId = $event" />
            <b-row>
                <b-col>
                    <b-form-group label="Title">
                        <b-form-input v-model="name" placeholder="Exclusive VIP collection" />
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="Symbol">
                        <b-form-input v-model="symbol" placeholder="NFT-VIP" />
                    </b-form-group>
                </b-col>
            </b-row>
            <b-form-group label="Description">
                <b-form-textarea
                    v-model="description"
                    placeholder="Short explanation about the purpose of this collection."
                />
            </b-form-group>
            <b-form-group label="Icon image">
                <b-form-file v-model="logoImg" accept="image/*" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
                Create NFT
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { ERC721Variant, TERC721, TERC721DefaultProp } from '@thxnetwork/dashboard/types/erc721';
import { Component, Vue } from 'vue-property-decorator';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
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
    schema: TERC721DefaultProp[] = [
        {
            name: 'name',
            propType: 'string',
            description: 'The name of this item.',
            disabled: true,
        },
        {
            name: 'description',
            propType: 'string',
            description: 'A brief description of your item.',
            disabled: true,
        },

        {
            name: 'image',
            propType: 'image',
            description: 'A visual representation of the item.',
            disabled: true,
        },
        {
            name: 'external_url',
            propType: 'link',
            description: 'A link referencing to a page with more information on the item.',
            disabled: true,
        },
    ];
    logoImg: File | null = null;

    async submit() {
        this.loading = true;

        const data = {
            chainId: this.chainId,
            name: this.name,
            symbol: this.symbol,
            description: this.description,
            schema: this.schema,
            file: this.logoImg,
        };

        await this.$store.dispatch('erc721/create', data);

        this.$bvModal.hide(`modalERC721Create`);
        this.loading = false;
    }
}
</script>
<style lang="scss"></style>
