<template>
    <base-modal :loading="loading" :error="error" title="Create Token Pool" id="modalAssetPoolCreate">
        <template #modal-body v-if="profile && !loading">
            <base-form-select-network @selected="onSelectChain" />
            <b-form-group>
                <label> Token Contract </label>
                <base-dropdown-select-erc20 :chainId="chainId" @selected="onSelectERC20Token" />
            </b-form-group>
            <b-form-group>
                <label> NFT Contract </label>
                <base-dropdown-select-erc-721 :chainId="chainId" @selected="onSelectERC721Token" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="disabled" class="rounded-pill" @click="submit()" variant="primary" block>
                Create Token Pool
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxprotocol/dashboard/types/enums/ChainId';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormSelectNetwork from '@thxprotocol/dashboard/components/form-select/BaseFormSelectNetwork.vue';
import BaseDropdownSelectErc20 from '@thxprotocol/dashboard/components/dropdowns/BaseDropdownSelectERC20.vue';
import BaseDropdownSelectMultipleErc20 from '@thxprotocol/dashboard/components/dropdowns/BaseDropdownSelectMultipleERC20.vue';
import BaseDropdownSelectErc721 from '@thxprotocol/dashboard/components/dropdowns/BaseDropdownSelectERC721.vue';
import BaseModal from './BaseModal.vue';
import { IAccount } from '@thxprotocol/dashboard/types/account';
import { TERC20 } from '@thxprotocol/dashboard/types/erc20';
import { TERC721 } from '@thxprotocol/dashboard/types/erc721';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseDropdownSelectErc20,
        BaseDropdownSelectMultipleErc20,
        BaseDropdownSelectErc721,
    },
    computed: mapGetters({
        profile: 'account/profile',
        erc20s: 'erc20/all',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    loading = false;
    error = '';
    chainId: ChainId = ChainId.PolygonMumbai;
    poolVariant = 'defaultPool';
    erc20Selectedtokens: TERC20[] = [];
    erc721Selectedtokens: TERC721[] = [];
    profile!: IAccount;

    get disabled() {
        return this.loading || (!this.erc20Selectedtokens.length && !this.erc721Selectedtokens.length);
    }

    onSelectChain(chainId: ChainId) {
        this.chainId = chainId;
        this.erc20Selectedtokens = [];
    }

    onSelectERC20Token(token: TERC20) {
        this.erc20Selectedtokens = token ? [token] : [];
    }

    onSelectERC721Token(token: TERC721) {
        this.erc721Selectedtokens = token ? [token] : [];
    }

    async submit() {
        this.loading = true;
        await this.$store.dispatch('pools/create', {
            chainId: this.chainId,
            erc20tokens: this.erc20Selectedtokens.map((t) => t.address), // TODO make this t._id and have API support it
            erc721tokens: this.erc721Selectedtokens.map((t) => t.address), // TODO make this t._id and have API support it
            variant: this.poolVariant,
        });
        this.$bvModal.hide(`modalAssetPoolCreate`);
        this.loading = false;
    }
}
</script>
