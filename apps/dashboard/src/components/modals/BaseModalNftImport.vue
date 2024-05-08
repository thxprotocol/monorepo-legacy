<template>
    <base-modal title="Import NFT Collection" id="modalNftImport">
        <template #modal-body title="Campaign">
            <b-card bg-variant="light" class="mb-3">
                <p class="text-muted">Select a campaign that should distribute your NFT rewards.</p>
                <BaseFormSelectNetwork @selected="onChangeNetwork" />
                <base-dropdown-select-pool class="ml-auto" :chainId="chainId" @selected="onChangePool" />
            </b-card>
            <b-alert v-if="pool" variant="info" show>
                Please transfer or mint tokens to this campaign contract address on {{ chainInfo[pool.chainId].name }}:
                <b-link
                    :href="`${chainInfo[pool.chainId].blockExplorer}/address/${pool.safeAddress}`"
                    class="font-weight-bold"
                >
                    {{ pool.safeAddress }}
                </b-link>
            </b-alert>
            <b-card bg-variant="light">
                <p class="text-muted">Provide details about your NFT collection.</p>
                <b-form-group label="NFT Standard">
                    <b-dropdown
                        variant="light"
                        toggle-class="form-control d-flex align-items-center justify-content-between"
                        menu-class="w-100"
                        class="w-100"
                    >
                        <template #button-content>
                            <strong>{{ variant.toUpperCase() }}</strong>
                        </template>
                        <b-dropdown-item-btn :key="key" v-for="(v, key) of NFTVariant" @click="onChangeVariant(v)">
                            {{ v.toUpperCase() }}
                        </b-dropdown-item-btn>
                    </b-dropdown>
                </b-form-group>
                <b-form-group label="NFT Contract Address" class="mb-0">
                    <b-input-group>
                        <b-form-input v-model="nftAddress" @input="getPreview" :disabled="!pool" />
                    </b-input-group>
                </b-form-group>
            </b-card>
            <hr />
            <p v-if="!tokens.length" class="text-muted">No tokens found for this campaign and NFT contract address.</p>
            <b-list-group v-else>
                <b-list-group-item
                    :key="key"
                    v-for="(token, key) of tokens"
                    class="d-flex align-items-center justify-content-between"
                >
                    <b-media>
                        <template #aside v-if="token.media.length">
                            <b-img
                                :src="token.media[0].thumbnail"
                                width="45"
                                class="rounded"
                                :alt="`Thumbnail for ${token.rawMetadata.name}`"
                            />
                        </template>
                        {{ token.balance }}x <strong>{{ token.rawMetadata.name }}</strong>
                        <br />
                        <b-link :href="token.tokenUri" target="_blank" class="m-0 small text-muted">
                            {{ token.tokenUri.raw }}
                        </b-link>
                    </b-media>
                </b-list-group-item>
            </b-list-group>
        </template>

        <template #btn-primary>
            <b-button
                @click="submit"
                :disabled="loading || !pool || !variant || !isValidAddress || !tokens.length"
                class="rounded-pill"
                variant="primary"
                block
            >
                <b-spinner v-if="loading" small />
                <template v-else> Import Tokens </template>
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseDropDownSelectPolygonERC20 from '../dropdowns/BaseDropDownSelectPolygonERC20.vue';
import BaseModal from './BaseModal.vue';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { isAddress } from 'web3-utils';
import BaseDropdownSelectPool from '../dropdowns/BaseDropdownSelectPool.vue';
import BaseDropdownSelectNftVariant from '../dropdowns/BaseDropdownSelectNftVariant.vue';
import { ChainId, NFTVariant } from '@thxnetwork/common/enums';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseDropDownSelectPolygonERC20,
        BaseDropdownSelectPool,
        BaseDropdownSelectNftVariant,
    },
})
export default class ModalNftImport extends Vue {
    NFTVariant = NFTVariant;
    variant: NFTVariant = NFTVariant.ERC1155;
    loading = false;
    chainInfo = chainInfo;
    nftAddress = '';
    nftLogoImgUrl = '';
    showPreview = false;
    tokens: {
        rawMetadata: { name: string };
        media: { thumbnail: string }[];
        balance: number;
        tokenId: number;
        tokenUri: { raw: string };
    }[] = [];
    previewLoading = false;
    pool: TPool | null = null;
    chainId: ChainId = ChainId.Polygon;

    get isValidAddress() {
        return isAddress(this.nftAddress);
    }

    onChangePool(pool: TPool) {
        this.pool = pool;
    }

    onChangeNetwork(chainId: ChainId) {
        this.chainId = chainId;
        this.pool = null;
    }

    onChangeVariant(variant: NFTVariant) {
        this.variant = variant;
        this.nftAddress = '';
    }

    async submit() {
        if (!this.pool) return;
        this.loading = true;

        try {
            await this.$store.dispatch(`${this.variant}/import`, {
                chainId: this.chainId,
                address: this.pool.safe.address,
                contractAddress: this.nftAddress,
            });

            this.$bvModal.hide(`modalNftImport`);
            this.tokens = [];
        } catch (error) {
            throw new Error((error as any).message);
        } finally {
            this.loading = false;
        }
    }

    async getPreview(address: string) {
        if (!this.pool || !isAddress(address)) {
            this.showPreview = false;
            this.tokens = [];
            return;
        }

        try {
            this.previewLoading = true;
            this.tokens = await this.$store.dispatch(`${this.variant}/preview`, {
                chainId: this.chainId,
                address: this.pool.safe.address,
                contractAddress: address,
            });
            this.previewLoading = false;
            this.showPreview = true;
        } catch (err) {
            this.previewLoading = false;
            this.showPreview = false;
        }
    }
}
</script>
