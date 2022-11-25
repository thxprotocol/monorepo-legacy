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
                <BaseModalRewardERC20Create
                    :id="'modalRewardERC20Create'"
                    :pool="pool"
                    :filteredRewards="rewardsByPage"
                    @submit="onSubmit"
                />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="sm">
                <template #cell(rewardCondition)="{ item }">
                    {{ RewardConditionPlatform[item.rewardCondition.platform] }}
                </template>
                <template #cell(actions)="{ item }">
                    <b-dropdown variant="link" size="sm">
                        <b-dropdown-item v-b-modal="'modalRewardERC20Create' + item.actions">Edit</b-dropdown-item>
                        <b-dropdown-item disabled>Delete</b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardERC20Create
                        :id="'modalRewardERC20Create' + item.actions"
                        :pool="pool"
                        :reward="erc20Rewards[pool._id][item.actions]"
                        :filteredRewards="rewardsByPage"
                        @submit="onSubmit"
                    />
                </template>
            </BTable>
        </BCard>
        <b-pagination
            class="mt-3"
            @change="onChangePage"
            v-model="page"
            :per-page="limit"
            :total-rows="total"
            align="center"
        ></b-pagination>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRewardERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC20Create.vue';
import BaseCardReward from '@thxnetwork/dashboard/components/list-items/BaseListItemReward.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { TRewardState } from '@thxnetwork/dashboard/store/modules/erc20Rewards';
import type { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import { RewardConditionPlatform, RewardConditionInteraction, TERC20Reward } from '@thxnetwork/types/index';

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
export default class ERC20RewardsView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    isLoading = true;
    limit = 10;
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
            .filter((reward: TERC20Reward) => {
                console.log(reward.page, this.page, this.limit);
                return reward.page === this.page;
            })
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TERC20Reward) => ({
                title: r.title,
                amount: r.amount,
                progress: r.rewardLimit > 0 ? `${r.progress}/${r.rewardLimit}` : r.progress,
                rewardCondition: {
                    platform: r.platform,
                    interaction: r.interaction,
                    content: r.content,
                },
                actions: r._id,
            }))
            .slice(0, this.limit);
    }

    mounted() {
        this.listRewards();
    }

    listRewards() {
        this.isLoading = true;
        this.$store
            .dispatch('erc20Rewards/list', {
                page: this.page,
                limit: this.limit,
                pool: this.pool,
            })
            .then(() => (this.isLoading = false));
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onSubmit() {
        this.page = 1;
        this.listRewards();
    }
}
</script>
