<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Rewards</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button
                    v-b-modal="'modalRewardCreate'"
                    @click="editingReward = null"
                    class="rounded-pill"
                    variant="primary"
                >
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">Create a reward</span>
                </b-button>
            </b-col>
        </b-row>
        <base-nothing-here
            v-if="!rewardsByPage.length"
            text-submit="Create a Reward"
            title="You have not created a reward yet"
            description="Use rewards to send your tokens to people and use reward configuration to limit claims."
            @clicked="$bvModal.show('modalRewardCreate')"
        />
        <base-card-reward
            @delete="listRewards"
            @edit="onEdit"
            :pool="pool"
            :reward="reward"
            :key="reward.id"
            v-for="reward of rewardsByPage"
        />
        <b-pagination
            class="mt-3"
            @change="onChangePage"
            v-model="page"
            :per-page="limit"
            :total-rows="total"
            align="center"
        ></b-pagination>
        <base-modal-reward-create
            :pool="pool"
            :erc721="erc721"
            :reward="editingReward"
            :filteredRewards="rewardsByPage"
            :filteredMetadata="filteredMetadata"
            @submit="onSubmit"
        />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRewardCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCreate.vue';
import BaseCardReward from '@thxnetwork/dashboard/components/list-items/BaseListItemReward.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { TReward, TRewardState } from '@thxnetwork/dashboard/store/modules/rewards';
import type { IERC721s, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { Reward } from '@thxnetwork/dashboard/types/rewards';

@Component({
    components: {
        BaseNothingHere,
        BaseModalRewardCreate,
        BaseCardReward,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'rewards/totals',
        rewards: 'rewards/all',
        erc721s: 'erc721/all',
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
    rewards!: TRewardState;
    erc721s!: IERC721s;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get erc721(): TERC721 | null {
        if (!this.pool.erc721) return null;
        return this.erc721s[this.pool.erc721._id];
    }

    get rewardsByPage() {
        if (!this.rewards[this.$route.params.id]) return [];
        return Object.values(this.rewards[this.$route.params.id])
            .filter((reward: TReward) => reward.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, this.limit);
    }

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('rewards/list', {
            page: this.page,
            limit: this.limit,
            poolId: this.pool._id,
        });
        this.isLoading = false;
    }

    async onEdit(reward: Reward) {
        this.editingReward = reward;
        this.$bvModal.show('modalRewardCreate');
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onSubmit() {
        this.page = 1;
        this.listRewards();
    }

    get filteredMetadata() {
        return this.erc721 && this.erc721.metadata && this.erc721.metadata.filter((m: TERC721Metadata) => !m.tokenId);
    }

    mounted() {
        this.listRewards();

        if (this.pool.erc721) {
            this.$store.dispatch('erc721/read', this.pool.erc721._id).then(async () => {
                await this.$store.dispatch('erc721/listMetadata', {
                    erc721: this.pool.erc721,
                    page: this.page,
                    limit: this.limit,
                });
            });
        }
    }
}
</script>
