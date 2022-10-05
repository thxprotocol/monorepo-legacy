<template>
    <b-dropdown size="sm" @show="getBalances()" variant="darker" no-caret v-if="profile">
        <template #button-content>
            <div class="d-flex align-items-center">
                <i class="fas fa-code-branch p-1 mr-2 text-success" style="font-size: 1.5rem"></i>
                <span class="d-none d-md-block text-muted">
                    Polygon
                </span>
            </div>
        </template>
        <template v-if="env !== 'production'">
            <b-dropdown-item target="_blank" :href="`https://hardhatscan.com/address/${profile.address}`">
                <i class="fas fa-code-branch text-muted mr-2"></i> Hardhat<br />
                <small class="text-muted">MATIC: {{ balances[ChainId.Hardhat] }}</small>
            </b-dropdown-item>
            <b-dropdown-divider
        /></template>
        <b-dropdown-item target="_blank" :href="`https://mumbai.polygonscan.com/address/${profile.address}`">
            <i class="fas fa-code-branch text-muted mr-2"></i> Polygon Mumbai<br />
            <small class="text-muted">MATIC: {{ balances[ChainId.PolygonMumbai] }}</small>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item target="_blank" :href="`https://polygonscan.com/address/${profile.address}`">
            <i class="fas fa-code-branch text-success mr-2"></i> Polygon <br />
            <small class="text-muted">MATIC: {{ balances[ChainId.Polygon] }}</small>
        </b-dropdown-item>
    </b-dropdown>
</template>
<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { fromWei } from 'web3-utils';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
    }),
})
export default class BaseNetworkSelect extends Vue {
    env = process.env.NODE_ENV;
    ChainId = ChainId;
    balances = {
        [ChainId.Ethereum]: 0,
        [ChainId.Arbitrum]: 0,
        [ChainId.BinanceSmartChain]: 0,
        [ChainId.Hardhat]: 0,
        [ChainId.PolygonMumbai]: 0,
        [ChainId.Polygon]: 0,
    };
    profile!: UserProfile;
    networks!: TNetworks;

    mounted() {
        this.getBalances();
    }

    getBalances() {
        if (this.env !== 'production') {
            this.getBalance(ChainId.Hardhat);
        }
        this.getBalance(ChainId.PolygonMumbai);
        this.getBalance(ChainId.Polygon);
    }

    async getBalance(chainId: ChainId) {
        this.balances[chainId] = Number(fromWei(await this.networks[chainId].eth.getBalance(this.profile.address)));
    }
}
</script>
