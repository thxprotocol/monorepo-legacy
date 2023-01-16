<template>
    <base-modal @show="onShow" :loading="loading" :error="error" :title="!pool ? 'Create Pool' : 'Edit Pool'" :id="id">
        <template #modal-body>
            <b-form-group label="Title">
                <b-form-input v-model="title" placeholder="My Loyalty Pool" class="mr-3" />
            </b-form-group>
            <base-form-select-network v-if="!loading" :chainId="chainId" :disabled="!!pool" @selected="onSelectChain" />
            <hr />
            <b-form-group>
                <b-form-checkbox v-model="archived" class="mr-3">Archived</b-form-checkbox>
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="disabled" class="rounded-pill" @click="submit()" variant="primary" block>
                {{ !pool ? 'Create Pool' : 'Edit Pool' }}
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
import { type IPool } from '../../store/modules/pools';
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
        erc20s: 'erc20/all',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    loading = false;
    error = '';
    chainId: ChainId = ChainId.Polygon;
    poolVariant = 'defaultPool';
    profile!: IAccount;
    chainInfo = chainInfo;

    @Prop() id!: string;
    @Prop() erc20?: TERC20;
    @Prop() erc721?: TERC721;
    @Prop({ required: false }) pool!: IPool;

    title = '';
    isEditMode = false;
    archived = false;

    get disabled() {
        return this.loading;
    }

    onSelectChain(chainId: ChainId) {
        this.chainId = chainId;
    }

    onShow() {
        this.title = this.pool ? this.pool.title : '';
        this.isEditMode = this.pool !== undefined;
        this.archived = this.pool ? this.pool.archived : false;
    }

    async submit() {
        this.loading = true;
        if (!this.isEditMode) {
            await this.$store.dispatch('pools/create', { chainId: this.chainId, title: this.title });
        } else {
            await this.$store.dispatch('pools/update', {
                pool: this.pool,
                data: {
                    title: this.title,
                    archived: this.archived,
                },
            });
        }

        this.$bvModal.hide(this.id);
        this.loading = false;
        this.$emit('created');
    }
}
</script>
