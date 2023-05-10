<template>
    <base-modal :loading="loading" title="Import NFT Collection" id="modalNftImport">
        <template #modal-body v-if="!loading">
            <base-dropdown-select-pool class="ml-auto" @selected="pool = $event" />
            <base-dropdown-select-nft-variant class="ml-auto" @selected="nftVariant = $event" />
            <b-form-group label="Contract Address">
                <b-input-group>
                    <b-form-input v-model="nftAddress" @input="getPreview" />
                    <template #append>
                        <b-button
                            v-if="pool"
                            variant="dark"
                            target="_blank"
                            :disabled="isValidAddress"
                            :href="chainInfo[pool.chainId].blockExplorer + `/token/${nftAddress}`"
                        >
                            <i class="fas fa-external-link-alt ml-0"></i>
                        </b-button>
                    </template>
                </b-input-group>
            </b-form-group>
            <div v-if="previewLoading">
                <p><i class="fas fa-spinner fa-spin"></i> loading token info...</p>
            </div>
            <div v-if="showPreview">
                <div v-if="nftVariant == NftVariant.ERC721">
                    <p>
                        <strong>{{ name }}</strong> ({{ symbol }})
                    </p>
                    <p><strong>Total Supply:</strong> {{ totalSupply }}</p>
                </div>
                <div v-else>
                    <p><strong>URI:</strong> {{ uri }}</p>
                </div>
            </div>
        </template>

        <template #btn-primary>
            <b-button
                :disabled="loading || !pool || !nftVariant || !isValidAddress"
                class="rounded-pill"
                @click="submit()"
                variant="primary"
                block
            >
                Import NFT Collection
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseDropDownSelectPolygonERC20 from '../dropdowns/BaseDropDownSelectPolygonERC20.vue';
import BaseModal from './BaseModal.vue';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { isAddress } from 'web3-utils';
import BaseDropdownSelectPool from '../dropdowns/BaseDropdownSelectPool.vue';
import BaseDropdownSelectNftVariant from '../dropdowns/BaseDropdownSelectNftVariant.vue';
import { NFTVariant } from '@thxnetwork/types/enums';
import { TPool } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseDropDownSelectPolygonERC20,
        BaseDropdownSelectPool,
        BaseDropdownSelectNftVariant,
    },
    computed: mapGetters({}),
})
export default class ModalNftImport extends Vue {
    NftVariant = NFTVariant;
    loading = false;
    chainInfo = chainInfo;
    nftAddress = '';
    nftLogoImgUrl = '';
    showPreview = false;
    name = '';
    symbol = '';
    totalSupply = '';
    uri = '';
    previewLoading = false;
    pool: TPool | null = null;
    nftVariant: NFTVariant | null = null;

    get isValidAddress() {
        return isAddress(this.nftAddress);
    }

    async submit() {
        this.loading = true;
        if (!this.pool) {
            return;
        }
        const data = {
            pool: this.pool,
            address: this.nftAddress,
            logoImgUrl: this.nftLogoImgUrl,
            name: this.name,
        };

        await this.$store.dispatch(`${this.nftVariant}/import`, data);

        this.$bvModal.hide(`modalERC721Import`);
        this.name = '';
        this.symbol = '';
        this.totalSupply = '';
        this.$emit('imported');
        this.loading = false;
    }

    async getPreview(address: string) {
        if (!this.pool || !isAddress(address)) {
            this.showPreview = false;
            this.name = '';
            this.symbol = '';
            this.totalSupply = '';
            this.uri = '';
            return;
        }

        try {
            this.previewLoading = true;
            const nftInfo = await this.$store.dispatch(`${this.nftVariant}/preview`, {
                chainId: this.pool.chainId,
                address: address,
            });
            this.name = nftInfo.name;
            this.symbol = nftInfo.symbol;
            this.totalSupply = nftInfo.totalSupply;
            this.uri = nftInfo.uri;
            this.previewLoading = false;
            this.showPreview = true;
        } catch (err) {
            this.previewLoading = false;
            this.showPreview = false;
            throw new Error('Invalid Contract Address');
        }
    }
}
</script>
