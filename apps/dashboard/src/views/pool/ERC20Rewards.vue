<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">ERC20 Rewards</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button v-b-modal="'modalRewardERC20Create'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">ERC20 Reward</span>
                </b-button>
            </b-col>
        </b-row>
        <BTable striped hover sticky-header :busy="isLoading" :items="rewardsByPage" responsive="sm">
            <template #cell(claims)="data">{{ data.item.claims.length }}</template>
            <template #cell(actions)="data">
                <b-link v-b-modal="'modalRewardERC20Create' + data.item">
                    <i class="fas fa-edit mr-3 text-dark"></i>
                </b-link>
                {{
                    Object.values(erc20Rewards).find((r) => {
                        r._id === data.item.actions;
                    })
                }}
                <BaseModalRewardERC20Create
                    :id="'modalRewardERC20Create' + data.item"
                    :pool="pool"
                    :reward="data"
                    :filteredRewards="rewardsByPage"
                    @submit="onSubmit"
                />
                <b-link @click="">
                    <i class="fas fa-trash-alt text-danger"></i>
                </b-link>
            </template>
        </BTable>
        <base-nothing-here
            v-if="!rewardsByPage.length"
            text-submit="Create a Reward"
            title="You have not created a reward yet"
            description="Use rewards to send your tokens to people and use reward configuration to limit claims."
            @clicked="$bvModal.show('modalRewardERC20Create')"
        />

        <!-- <base-card-reward
            @edit="onEdit"
            :pool="pool"
            :reward="reward"
            :key="reward._id"
            v-for="(reward) of rewardsByPage"
        /> -->

        <b-pagination
            class="mt-3"
            @change="onChangePage"
            v-model="page"
            :per-page="limit"
            :total-rows="total"
            align="center"
        ></b-pagination>

        <BaseModalRewardERC20Create
            :id="'modalRewardERC20Create'"
            :pool="pool"
            :filteredRewards="rewardsByPage"
            @submit="onSubmit"
        />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRewardERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC20Create.vue';
import BaseCardReward from '@thxnetwork/dashboard/components/list-items/BaseListItemReward.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { TReward, TRewardState } from '@thxnetwork/dashboard/store/modules/erc20Rewards';
import type { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import { Reward } from '@thxnetwork/dashboard/types/rewards';
import { TERC20Reward } from '@thxnetwork/types/';

@Component({
    components: {
        BaseNothingHere,
        BaseModalRewardERC20Create,
        BaseCardReward,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc20Rewards/totals',
        erc20Rewards: 'erc20Rewards/all',
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
    erc20Rewards!: TRewardState;
    erc721s!: IERC721s;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get rewardsByPage() {
        if (!this.erc20Rewards[this.$route.params.id]) return [];
        return Object.values(this.erc20Rewards[this.$route.params.id])
            .filter((reward: TERC20Reward) => reward.page === this.page)
            .map((r: TERC20Reward) => {
                console.log(r);
                return {
                    title: r.title,
                    description: r.description,
                    progress: r.rewardLimit > 0 ? `${r.progress}/${r.rewardLimit}` : r.progress,
                    rewardCondition: {
                        platform: r.platform,
                        interaction: r.interaction,
                        content: r.content,
                    },
                    actions: r._id,
                };
            })
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, this.limit);
    }

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('erc20Rewards/list', {
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

    mounted() {
        this.listRewards();
    }
}
</script>
