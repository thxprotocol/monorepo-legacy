<template>
    <base-modal :loading="loading" :error="error" :title="!pool ? 'Create Pool' : 'Edit Pool'" :id="id">
        <template #modal-body>
            <b-form-group label="Title">
                <b-form-input v-model="title" placeholder="My Loyalty Pool" class="mr-3" />
            </b-form-group>
            <b-form-group label="Network">
                <div v-if="!isEditMode">
                    <base-form-select-network v-if="!loading" :chainId="chainId" @selected="onSelectChain" />
                </div>

                <div class="d-flex align-items-center" v-else>
                    <img :src="chainInfo[pool.chainId].logo" width="20" height="20" class="mr-3" />
                    {{ chainInfo[pool.chainId].name }}
                </div>
            </b-form-group>
            <b-form-group label="Archived" v-if="isEditMode">
                <b-form-checkbox v-model="archived" class="mr-3" />
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
import { IPool } from '../../store/modules/pools';
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

    title = this.pool ? this.pool.title : '';
    isEditMode = this.pool !== undefined;
    archived = this.pool ? this.pool.archived : false;

    get disabled() {
        return this.loading;
    }

    onSelectChain(chainId: ChainId) {
        this.chainId = chainId;
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
