<template>
    <base-modal :error="error" title="Create NFT collection" id="modalERC721Create">
        <template #modal-body v-if="!loading">
            <base-form-select-network @selected="chainId = $event" />
            <b-form-group label="Variant">
                <b-row>
                    <b-col>
                        <b-form-radio v-model="variant" name="paymentVariant" :value="NFTVariant.ERC721">
                            <strong> ERC721</strong>
                        </b-form-radio>
                    </b-col>
                    <b-col>
                        <b-form-radio v-model="variant" name="paymentVariant" :value="NFTVariant.ERC1155">
                            <strong> ERC1155</strong>
                        </b-form-radio>
                    </b-col>
                </b-row>
            </b-form-group>
            <b-row>
                <b-col>
                    <b-form-group label="Title">
                        <b-form-input v-model="name" placeholder="Exclusive VIP collection" />
                    </b-form-group>
                </b-col>
                <b-col v-if="variant === NFTVariant.ERC721">
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
            <b-button :disabled="loading" class="rounded-pill" @click="onClickSubmit" variant="primary" block>
                Create NFT
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { ERC721Variant, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Vue } from 'vue-property-decorator';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';
import { NFTVariant } from '@thxnetwork/common/enums';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
    },
})
export default class ModalERC721Create extends Vue {
    NFTVariant = NFTVariant;
    ERC721Variant = ERC721Variant;
    loading = false;
    error = '';
    variant = NFTVariant.ERC721;
    tokenList: TERC721[] = [];
    chainId: ChainId = ChainId.PolygonMumbai;
    erc721Token: TERC721 | null = null;
    name = '';
    symbol = '';
    description = '';
    logoImg: File | null = null;

    async onClickSubmit() {
        this.loading = true;
        await this.create(this.variant);
        this.$bvModal.hide(`modalERC721Create`);
        this.loading = false;
    }

    async create(variant: NFTVariant) {
        switch (variant) {
            case NFTVariant.ERC721: {
                return await this.$store.dispatch('erc721/create', {
                    chainId: this.chainId,
                    name: this.name,
                    symbol: this.symbol,
                    description: this.description,
                    file: this.logoImg,
                });
            }
            case NFTVariant.ERC1155: {
                return await this.$store.dispatch('erc1155/create', {
                    chainId: this.chainId,
                    name: this.name,
                    description: this.description,
                    file: this.logoImg,
                });
            }
        }
    }
}
</script>
<style lang="scss"></style>
