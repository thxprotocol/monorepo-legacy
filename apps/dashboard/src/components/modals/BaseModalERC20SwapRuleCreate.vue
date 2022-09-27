<template>
    <base-modal :loading="loading" :error="error" title="Create Swap Rule" id="modalERC20SwapRuleCreate">
        <template #modal-body v-if="profile && !loading">
            <b-form-group :label="`Allow ${pool.erc20.symbol} swaps against`">
                <base-dropdown-select-erc20 :chainId="pool.chainId" @selected="onSelectToken" />
            </b-form-group>
            <b-form-group>
                <label>Token Ratio</label>
                <b-form-input type="number" v-model="tokenMultiplier" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="loading || isSubmitDisabled"
                class="rounded-pill"
                @click="submit()"
                variant="primary"
                block
            >
                Create Swap Rule
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseDropdownSelectErc20 from '@thxprotocol/dashboard/components/dropdowns/BaseDropdownSelectERC20.vue';
import BaseModal from './BaseModal.vue';
import { AxiosError } from 'axios';
import { IAccount } from '@thxprotocol/dashboard/types/account';
import { TERC20 } from '@thxprotocol/dashboard/types/erc20';
import { ChainId } from '@thxprotocol/dashboard/types/enums/ChainId';
import { IPools } from '@thxprotocol/dashboard/store/modules/pools';

@Component({
    components: {
        BaseModal,
        BaseDropdownSelectErc20,
    },
    computed: mapGetters({
        profile: 'account/profile',
        pools: 'pools/all',
        erc20s: 'erc20/all',
    }),
})
export default class ModalERC20SwapRuleCreate extends Vue {
    loading = false;
    error = '';
    tokenMultiplier = 0;
    token: TERC20 | null = null;
    tokenAddress = '';
    profile!: IAccount;
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;

    get isSubmitDisabled() {
        return (
            (this.token && this.token.address == this.pool.erc20.address) ||
            !this.tokenMultiplier ||
            this.tokenMultiplier <= 0
        );
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    onSelectToken(token: TERC20) {
        this.token = token;
        this.tokenAddress = token ? token.address : '';
    }

    @Prop() onSuccess!: () => void;

    async submit() {
        this.loading = true;
        try {
            await this.$store.dispatch('swaprules/create', {
                chainId: this.chainId,
                tokenInAddress: this.tokenAddress,
                tokenMultiplier: this.tokenMultiplier,
                pool: this.pool,
            });
            this.$bvModal.hide(`modalERC20SwapRuleCreate`);
            this.onSuccess();
        } catch (error) {
            this.error = (error as AxiosError).response?.data.error.message || 'Could not create the Swap Rule';
        } finally {
            this.loading = false;
        }
    }
}
</script>
