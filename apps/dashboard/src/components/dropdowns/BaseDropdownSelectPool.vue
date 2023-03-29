<template>
    <div>
        <BaseFormSelectNetwork @selected="onNetworkSelected" />
        <b-form-group label="Pool">
            <b-dropdown variant="link" class="dropdown-select" v-if="poolsPerChain.length">
                <template #button-content>
                    <div v-if="pool">{{ pool.settings.title }}</div>
                    <div v-else>Select a pool</div>
                </template>
                <b-dropdown-item-button
                    :key="p.address"
                    v-for="p of poolsPerChain"
                    :disabled="p.settings.isArchived"
                    @click="onListItemClick(p)"
                >
                    {{ p.settings.title }}
                </b-dropdown-item-button>
            </b-dropdown>
            <b-alert variant="info" show class="mb-0" v-else>No pools available for this chain.</b-alert>
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '../BaseIdenticon.vue';

import { type TPool } from '@thxnetwork/types/interfaces';
import { IPools } from '../../store/modules/pools';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import BaseFormSelectNetwork from '../form-select/BaseFormSelectNetwork.vue';

@Component({
    components: {
        BaseIdenticon,
        BaseFormSelectNetwork,
    },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    pools!: IPools;
    pool: TPool | null = null;
    loading = false;
    selectedChainId: ChainId | null = null;

    onListItemClick(pool: TPool | null) {
        this.pool = pool;
        this.$emit('selected', this.pool);
    }

    get hasPools() {
        return this.pools && Object.keys(this.pools).length;
    }

    get poolsPerChain() {
        return Object.values(this.pools).filter((pool) => pool.chainId === this.selectedChainId);
    }

    async onNetworkSelected(chainId: ChainId) {
        this.selectedChainId = chainId;
    }
}
</script>
