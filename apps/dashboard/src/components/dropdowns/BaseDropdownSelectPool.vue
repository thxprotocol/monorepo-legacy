<template>
    <b-form-group label="Campaign" class="mb-0">
        <b-dropdown
            variant="light"
            toggle-class="form-control d-flex align-items-center justify-content-between"
            menu-class="w-100"
            class="w-100"
            v-if="poolsPerChain.length"
        >
            <template #button-content>
                <div v-if="pool">{{ pool.settings.title }}</div>
                <div v-else>Select a pool</div>
            </template>
            <b-dropdown-item-button :key="p.safe.address" v-for="p of poolsPerChain" @click="onListItemClick(p)">
                {{ p.settings.title }}
            </b-dropdown-item-button>
        </b-dropdown>
        <b-alert variant="info" show class="mb-0" v-else>Could not find a campaign Safe for this network.</b-alert>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools } from '../../store/modules/pools';
import { ChainId } from '@thxnetwork/common/enums';
import BaseIdenticon from '../BaseIdenticon.vue';
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

    @Prop() chainId!: ChainId;

    onListItemClick(pool: TPool | null) {
        this.pool = pool;
        this.$emit('selected', this.pool);
    }

    get hasPools() {
        return this.pools && Object.keys(this.pools).length;
    }

    get poolsPerChain() {
        return Object.values(this.pools).filter((pool) => pool.safe && pool.safe.chainId === this.chainId);
    }
}
</script>
