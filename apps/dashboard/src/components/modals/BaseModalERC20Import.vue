<template>
    <base-modal :loading="loading" title="Import Token Contract" id="modalERC20Import">
        <template #modal-body v-if="!loading">
            <BaseFormSelectNetwork @selected="chainId = $event" />
            <b-form-group label="Existing ERC20 contract">
                <BaseDropDownSelectPolygonERC20 :erc20="erc20" :chainId="chainId" @selected="onERC20Selected($event)" />
            </b-form-group>
            <b-form-group label="Contract Address">
                <b-input-group>
                    <b-form-input v-model="erc20Address" :disabled="!!erc20" @input="getPreview" />
                    <template #append>
                        <b-button
                            v-if="erc20"
                            variant="dark"
                            target="_blank"
                            :href="chainInfo[erc20.chainId].blockExplorer"
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
                :disabled="loading || !isValidAddress"
                class="rounded-pill"
                @click="submit()"
                variant="primary"
                block
            >
                Import ERC20 Token
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseDropDownSelectPolygonERC20 from '../dropdowns/BaseDropDownSelectPolygonERC20.vue';
import BaseModal from './BaseModal.vue';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { isAddress } from 'web3-utils';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseDropDownSelectPolygonERC20,
    },
    computed: mapGetters({}),
})
export default class ModalERC20Import extends Vue {
    loading = false;
    chainInfo = chainInfo;
    chainId: ChainId = ChainId.Polygon;
    erc20: TERC20 | null = null;
    erc20Address = '';
    erc20LogoImgUrl = '';
    showPreview = false;
    name = '';
    symbol = '';
    totalSupply = '';
    previewLoading = false;

    get isValidAddress() {
        return isAddress(this.erc20Address);
    }

    async submit() {
        this.loading = true;

        const data = {
            chainId: this.chainId,
            address: this.erc20Address,
            logoImgUrl: this.erc20LogoImgUrl,
        };

        await this.$store.dispatch('erc20/import', data);

        this.$bvModal.hide(`modalERC20Import`);
        this.loading = false;
        this.erc20 = null;
    }

    onERC20Selected(erc20: TERC20) {
        this.erc20 = erc20;
        this.erc20Address = erc20 ? erc20.address : '';
        this.erc20LogoImgUrl = erc20 && erc20.logoURI ? erc20.logoURI : '';
    }

    async getPreview(address: string) {
        if (address.length != 42) {
            this.showPreview = false;
            this.name = '';
            this.symbol = '';
            this.totalSupply = '';
            return;
        }
        try {
            this.previewLoading = true;
            const { name, symbol, totalSupply } = await this.$store.dispatch('erc20/preview', {
                chainId: this.chainId,
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
<style lang="scss"></style>
