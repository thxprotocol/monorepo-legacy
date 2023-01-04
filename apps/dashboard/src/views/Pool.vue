<template>
    <div class="container container-md pt-5" v-if="pool">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { fromWei } from 'web3-utils';
import { IAccount } from '../types/account';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    chainId: ChainId = ChainId.PolygonMumbai;
    account!: IAccount;
    pools!: IPools;
    ERC20Type = ERC20Type;
    fromWei = fromWei;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async mounted() {
        this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('pools/read', this.$route.params.id).then(() => {
            this.chainId = this.pool.chainId;
        });
    }
}
</script>
