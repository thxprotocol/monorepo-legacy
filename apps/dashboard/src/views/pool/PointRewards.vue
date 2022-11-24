<template>
    <div>
        <BRow class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Point Rewards</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button
                    v-b-modal="'modalRewardPointsCreate'"
                    @click="editingReward = null"
                    class="rounded-pill"
                    variant="primary"
                >
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">Points reward</span>
                </b-button>
            </b-col>
        </BRow>
        <BTable striped hover :items="Object.values(pointRewards)"></BTable>
        <BaseModalRewardPointsCreate :pool="pool" />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRewardPointsCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardPointsCreate.vue';
import BaseCardReward from '@thxnetwork/dashboard/components/list-items/BaseListItemReward.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { TRewardState } from '@thxnetwork/dashboard/store/modules/erc20Rewards';
import { Reward } from '@thxnetwork/dashboard/types/rewards';

@Component({
    components: {
        BaseNothingHere,
        BaseModalRewardPointsCreate,
        BaseCardReward,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc20Rewards/totals',
        pointRewards: 'pointRewards/all',
    }),
})
export default class AssetPoolView extends Vue {
    docsUrl = process.env.VUE_APP_DOCS_URL;
    apiUrl = process.env.VUE_APP_API_ROOT;
    widgetUrl = process.env.VUE_APP_WIDGET_URL;

    error = '';
    loading = true;
    editingReward: Reward | null = null;
    rewardsLoading = true;
    assetPoolLoading = true;
    isGovernanceEnabled = false;
    isLoading = true;
    limit = 5;
    page = 1;

    pools!: IPools;
    totals!: { [poolId: string]: number };
    pointRewards!: TRewardState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('pointRewards/list', this.pool._id);
        this.isLoading = false;
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onSubmit() {
        this.page = 1;
        this.listRewards();
    }

    mounted() {
        this.listRewards();
    }
}
</script>
