<template>
    <div>
        <BaseFormSelectNetwork @selected="onNetworkSelected" />
        <b-form-group>
            <label>Pool</label>
            <b-dropdown variant="link" class="dropdown-select" v-if="hasPools">
                <template #button-content>
                    <div v-if="pool">
                        <div class="d-flex align-items-center">
                            <strong class="mr-1">{{ pool.title }}</strong>
                        </div>
                    </div>
                    <div v-else>Select a Loyalty Pool</div>
                </template>
                <b-dropdown-divider />

                <b-dropdown-item-button
                    :key="p.address"
                    v-for="p of pools"
                    :disabled="p.archived"
                    @click="onListItemClick(p)"
                >
                    <strong>{{ p.title }}</strong>
                </b-dropdown-item-button>
            </b-dropdown>
            <div v-else class="small">No Pools available</div>
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '../BaseIdenticon.vue';

import { IPool, IPools } from '../../store/modules/pools';
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
    pool: IPool | null = null;
    loading = false;
    selectedChainId: ChainId | null = null;

    async mounted() {
        await this.getPoolList();
    }

    onListItemClick(pool: IPool | null) {
        this.pool = pool;
        this.$emit('selected', this.pool);
    }

    async getPoolList() {
        if (!this.selectedChainId) {
            return;
        }
        this.loading = true;
        await this.$store.dispatch('pools/list', { chainId: this.selectedChainId });
        this.loading = false;
    }

    get hasPools() {
        return this.pools && Object.keys(this.pools).length;
    }

    async onNetworkSelected(chainId: ChainId) {
        this.selectedChainId = chainId;
        await this.getPoolList();
    }
}
</script>
