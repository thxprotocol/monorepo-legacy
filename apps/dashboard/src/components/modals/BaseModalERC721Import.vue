<template>
    <base-modal :loading="loading" title="Import NFT Contract" id="modalERC721Import">
        <template #modal-body v-if="!loading">
            <b-form-group>
                <base-dropdown-select-pool class="ml-auto" @selected="pool = $event" />
            </b-form-group>
            <b-form-group label="Contract Address">
                <b-input-group>
                    <b-form-input v-model="erc721Address" @input="getPreview" />

                    <template #append>
                        <b-button
                            v-if="pool"
                            variant="dark"
                            target="_blank"
                            :disabled="isValidAddress"
                            :href="chainInfo[pool.chainId].blockExplorer + `/token/${erc721Address}`"
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
                <p>
                    <strong>{{ name }}</strong> ({{ symbol }})
                </p>
                <p><strong>Total Supply:</strong> {{ totalSupply }}</p>
            </div>
        </template>

        <template #btn-primary>
            <b-button
                :disabled="loading || !pool || !isValidAddress"
                class="rounded-pill"
                @click="submit()"
                variant="primary"
                block
            >
                Import ERC721 Tokens
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
import { IPool } from '../../store/modules/pools';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseDropDownSelectPolygonERC20,
        BaseDropdownSelectPool,
    },
    computed: mapGetters({}),
})
export default class ModalERC721Import extends Vue {
    loading = false;
    chainInfo = chainInfo;
    erc721Address = '';
    erc721LogoImgUrl = '';
    showPreview = false;
    name = '';
    symbol = '';
    totalSupply = '';
    previewLoading = false;
    pool: IPool | null = null;

    get isValidAddress() {
        return isAddress(this.erc721Address);
    }

    async submit() {
        this.loading = true;
        if (!this.pool) {
            return;
        }
        const data = {
            pool: this.pool,
            address: this.erc721Address,
            logoImgUrl: this.erc721LogoImgUrl,
        };

        await this.$store.dispatch('erc721/import', data);
        this.loading = false;
    }

    async getPreview(address: string) {
        if (!this.pool || !isAddress(address)) {
            this.showPreview = false;
            this.name = '';
            this.symbol = '';
            this.totalSupply = '';
            return;
        }

        try {
            this.previewLoading = true;
            const { name, symbol, totalSupply } = await this.$store.dispatch('erc721/preview', {
                chainId: this.pool.chainId,
                address: address,
            });
            this.name = name;
            this.symbol = symbol;
            this.totalSupply = totalSupply;
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
