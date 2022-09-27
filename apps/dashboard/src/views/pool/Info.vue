<template>
    <div class="mb-5 pb-5">
        <h2 class="font-weight-normal">Information</h2>
        <p>Addresses and links to the block explorer pages regarding the smart contracts related to your pool.</p>
        <b-card class="shadow-sm mb-5">
            <b-form-group>
                <label for="clientId"> Pool Contract </label>
                <div class="input-group">
                    <b-form-input readonly id="address" v-model="pool.address" />
                    <div class="input-group-append">
                        <b-button
                            class="btn btn-primary"
                            type="button"
                            variant="primary"
                            target="_blank"
                            v-b-tooltip
                            title="View your pool transactions on the Polygon block explorer"
                            :href="`${chainInfo[pool.chainId].blockExplorer}/address/${pool.address}/transactions`"
                        >
                            <i class="fas fa-external-link-alt m-0" style="font-size: 1.2rem"></i>
                        </b-button>
                    </div>
                </div>
            </b-form-group>
            <b-form-group v-if="pool.erc20" label="ERC20 Contract">
                <div class="input-group">
                    <b-form-input readonly id="address" v-model="pool.erc20.address" />
                    <div class="input-group-append">
                        <b-button
                            class="btn btn-primary"
                            type="button"
                            variant="primary"
                            target="_blank"
                            v-b-tooltip
                            title="View your token transactions on the Polygon block explorer"
                            :href="`${chainInfo[pool.chainId].blockExplorer}/token/${pool.erc20.address}`"
                        >
                            <i class="fas fa-external-link-alt m-0" style="font-size: 1.2rem"></i>
                        </b-button>
                    </div>
                </div>
            </b-form-group>
            <b-form-group v-if="pool.erc721" label="ERC721 Contract">
                <div class="input-group">
                    <b-form-input readonly id="address" v-model="pool.erc721.address" />
                    <div class="input-group-append">
                        <b-button
                            class="btn btn-primary"
                            type="button"
                            variant="primary"
                            target="_blank"
                            v-b-tooltip
                            title="View your token transactions on the Polygon block explorer"
                            :href="`${chainInfo[pool.chainId].blockExplorer}/token/${pool.erc721.address}`"
                        >
                            <i class="fas fa-external-link-alt m-0" style="font-size: 1.2rem"></i>
                        </b-button>
                    </div>
                </div>
            </b-form-group>
        </b-card>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class AssetPoolView extends Vue {
    ChainId = ChainId;
    chainInfo = chainInfo;
    chainId: ChainId = ChainId.PolygonMumbai;
    loading = true;
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
