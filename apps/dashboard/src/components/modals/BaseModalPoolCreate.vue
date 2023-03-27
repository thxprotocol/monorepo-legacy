<template>
    <base-modal :loading="loading" :error="error" title="Create Pool" :id="id">
        <template #modal-body v-if="!loading">
            <b-form-group label="Title">
                <b-form-input v-model="title" placeholder="My Loyalty Pool" class="mr-3" />
            </b-form-group>
            <base-form-select-network v-if="!loading" :chainId="chainId" @selected="onSelectChain" />
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
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
import BaseIdenticon from '../BaseIdenticon.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';

@Component({
    components: {
        BaseModal,
        BaseFormSelectNetwork,
        BaseIdenticon,
        chainInfo,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    loading = false;
    error = '';
    chainId: ChainId = ChainId.Polygon;
    poolVariant = 'defaultPool';
    profile!: IAccount;
    chainInfo = chainInfo;
    title = '';

    @Prop() id!: string;

    onSelectChain(chainId: ChainId) {
        this.chainId = chainId;
    }

    async submit() {
        this.loading = true;

        await this.$store.dispatch('pools/create', { chainId: this.chainId, title: this.title });

        this.$bvModal.hide(this.id);
        this.loading = false;
        this.$emit('created');
    }
}
</script>
