<template>
    <base-modal :loading="loading" :error="error" title="Create Pool" :id="id">
        <template #modal-body v-if="!loading">
            <base-form-select-network :chainId="chainId" @selected="onSelectChain" />
        </template>
        <template #btn-primary>
            <b-button :disabled="disabled" class="rounded-pill" @click="submit()" variant="primary" block>
                Create Pool
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormSelectNetwork from '@thxnetwork/dashboard/components/form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';
import type { IAccount } from '@thxnetwork/dashboard/types/account';
import type { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import type { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        erc20s: 'erc20/all',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    loading = false;
    error = '';
    chainId: ChainId = ChainId.Polygon;
    poolVariant = 'defaultPool';
    profile!: IAccount;

    @Prop() id!: string;
    @Prop() erc20?: TERC20;
    @Prop() erc721?: TERC721;

    get disabled() {
        return this.loading;
    }

    onSelectChain(chainId: ChainId) {
        this.chainId = chainId;
    }

    async submit() {
        this.loading = true;

        await this.$store.dispatch('pools/create', { chainId: this.chainId });

        this.$bvModal.hide(this.id);
        this.loading = false;
        this.$emit('created');
    }
}
</script>
