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
                <BaseModalRewardERC20Create :id="'modalRewardERC20Create'" :pool="pool" @submit="onSubmit" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <div class="p-3 d-flex align-items-center justify-content-end">
                <span class="text-muted mr-2">
                    Selected <strong>{{ selected.length }}</strong> item{{ selected.length === 1 ? '' : 's' }}
                </span>
                <span class="text-muted mr-2">Limit</span>
                <b-form-select
                    @change="onChange"
                    style="max-width: 75px"
                    size="sm"
                    :value="limit"
                    :options="[5, 10, 25, 50, 100]"
                />
            </div>
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="sm" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #head(title)> Title </template>
                <template #head(progress)> Progress </template>
                <template #head(rewardCondition)> Condition </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selected" />
                </template>
                <template #cell(amount)="{ item }">
                    <b-badge variant="success" class="p-2"> {{ item.amount }} {{ pool.erc20.symbol }} </b-badge>
                </template>
                <template #cell(progress)="{ item }">
                    <b-progress style="border-radius: 0.3rem">
                        <b-progress-bar
                            :label="
                                item.progress.limit
                                    ? `${item.progress.progress}/${item.progress.limit}`
                                    : String(item.progress.progress)
                            "
                            :value="item.progress.progress"
                            :min="0"
                            :max="item.progress.limit || item.progress.progress"
                        />
                    </b-progress>
                </template>
                <template #cell(rewardCondition)="{ item }">
                    <BaseBadgeRewardConditionPreview
                        v-if="item.rewardCondition.platform.type !== RewardConditionPlatform.None"
                        :rewardCondition="item.rewardCondition"
                    />
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalRewardERC20Create' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item disabled>Delete</b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardERC20Create
                        :id="'modalRewardERC20Create' + item.id"
                        :pool="pool"
                        :reward="erc20Rewards[pool._id][item.id]"
                        @submit="onSubmit"
                    />
                </template>
            </BTable>
        </BCard>
        <b-pagination
            v-if="total > limit"
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
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';

@Component({
    components: {
        BaseNothingHere,
        BaseModalRewardERC20Create,
        BaseCardReward,
        BaseBadgeRewardConditionPreview,
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
    selected: string[] = [];

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
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TERC20Reward) => ({
                checkbox: r._id,
                amount: r.amount,
                title: r.title,
                rewardCondition: {
                    platform: platformList.find((p) => r.platform === p.type),
                    interaction: platformInteractionList.find((i) => r.interaction === i.type),
                    content: r.content,
                },
                progress: {
                    limit: r.rewardLimit,
                    progress: r.progress,
                },
                id: r._id,
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

    onChange(limit: number) {
        this.limit = limit;
        this.listRewards();
    }

    onChecked(checked: boolean) {
        this.selected = checked ? this.rewardsByPage.map((r) => r.id) : [];
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
