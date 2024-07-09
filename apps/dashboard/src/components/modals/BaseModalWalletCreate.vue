<template>
    <BaseModal :error="error" title="Create Wallet" :id="id">
        <template #modal-body>
            <BaseDropdownNetwork :chain-id="chainId" @selected="chainId = $event" />
        </template>
        <template #btn-primary>
            <b-button :disabled="isDisabled" class="rounded-pill" @click="submit()" variant="primary" block>
                <b-spinner v-if="isLoading" small />
                <span v-else> Create Wallet </span>
            </b-button>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { ChainId } from '@thxnetwork/common/enums';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseDropdownNetwork from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownNetwork.vue';

@Component({
    components: {
        BaseModal,
        BaseDropdownNetwork,
    },
})
export default class BaseModalWalletCreate extends Vue {
    chainInfo = chainInfo;
    isLoading = false;
    error = '';
    chainId = ChainId.Polygon;

    @Prop() id!: string;
    @Prop() pool!: TPool;

    get isDisabled() {
        return this.isLoading;
    }

    async submit() {
        try {
            this.isLoading = true;

            await this.$store.dispatch('pools/createWallet', {
                pool: this.pool,
                chainId: this.chainId,
            });
        } catch (error) {
            this.error = error as string;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
