<template>
    <base-modal :loading="loading" title="Import Token Contract" id="modalERC20Import">
        <template #modal-body v-if="!loading">
            <BaseFormSelectNetwork :chainId="selectedChainId" @selected="selectedChainId = $event" />
            <b-form-group label="Existing ERC20 contract">
                <BaseDropDownSelectPolygonERC20
                    :erc20="erc20"
                    :chainId="selectedChainId"
                    @selected="onERC20Selected($event)"
                />
            </b-form-group>
            <b-form-group label="Contract Address">
                <b-input-group>
                    <b-form-input v-model="erc20Address" :disabled="!!erc20" @input="onInputAddress" />
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
            <b-card v-if="showPreview">
                <b-form-group label="Name">
                    <strong>{{ name }}</strong>
                </b-form-group>
                <b-form-group label="Symbol">
                    <strong>{{ symbol }}</strong>
                </b-form-group>
                <b-form-group label="Total Supply (wei)">
                    <strong>{{ totalSupplyInWei }}</strong>
                </b-form-group>
            </b-card>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
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
    selectedChainId: ChainId | null = null;
    erc20: TERC20 | null = null;
    erc20Address = '';
    erc20LogoImgUrl = '';
    showPreview = false;
    name = '';
    symbol = '';
    totalSupplyInWei = '';
    previewLoading = false;

    @Prop() chainId!: ChainId;

    get isValidAddress() {
        return isAddress(this.erc20Address);
    }

    async submit() {
        this.loading = true;

        await this.$store.dispatch('erc20/import', {
            chainId: this.selectedChainId,
            address: this.erc20Address,
            logoImgUrl: this.erc20LogoImgUrl,
        });

        this.$bvModal.hide(`modalERC20Import`);
        this.loading = false;
        this.erc20 = null;
    }

    onERC20Selected(erc20: TERC20) {
        this.erc20 = erc20;
        this.erc20Address = erc20 ? erc20.address : '';
        this.erc20LogoImgUrl = erc20 && erc20.logoURI ? erc20.logoURI : '';
    }

    async onInputAddress(address: string) {
        if (!isAddress(address)) throw new Error('Invalid Contract Address');

        try {
            this.previewLoading = true;
            const { name, symbol, totalSupplyInWei } = await this.$store.dispatch('erc20/preview', {
                chainId: this.selectedChainId,
                address: address,
            });
            this.name = name;
            this.symbol = symbol;
            this.totalSupplyInWei = totalSupplyInWei;
            this.previewLoading = false;
            this.showPreview = true;
        } catch (err) {
            this.previewLoading = false;
            this.showPreview = false;
            throw new Error('Could not import for this address.');
        }
    }
}
</script>
