<template>
    <div class="container-md container-pool" v-if="pool">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { fromWei } from 'web3-utils';
import type { TAccount } from '@thxnetwork/types/interfaces';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    account!: TAccount;
    pools!: IPools;
    ERC20Type = ERC20Type;
    fromWei = fromWei;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async mounted() {
        this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('pools/read', this.$route.params.id);
    }
}
</script>

<style>
.container-pool {
    padding-top: 35px !important;
}
</style>
