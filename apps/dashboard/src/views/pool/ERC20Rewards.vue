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
                <BaseModalRewardERC20Create :id="'modalRewardERC20Create'" :pool="pool" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :rewards="erc20Rewards[pool._id]"
                :totals="totals"
                :selectedItems="selectedItems"
                :showDownloadQRCodes="true"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
                @delete="onDelete"
            />
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
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
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(amount)="{ item }">
                    <b-badge variant="dark" class="p-2"> {{ item.amount }} {{ pool.erc20.symbol }} </b-badge>
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
                <template #cell(claims)="{ item }">
                    <b-link v-b-modal="`modalRewardClaimsDownload${item.id}`"> Download </b-link>
                    <BaseModalRewardClaimsDownload
                        :id="`modalRewardClaimsDownload${item.id}`"
                        :pool="pool"
                        :selectedItems="[item.id]"
                        :rewards="erc20Rewards[pool._id]"
                    />
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalRewardERC20Create' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item
                            @click="$store.dispatch('erc20Rewards/delete', erc20Rewards[pool._id][item.id])"
                        >
                            Delete
                        </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardERC20Create
                        :id="'modalRewardERC20Create' + item.id"
                        :pool="pool"
                        :reward="erc20Rewards[pool._id][item.id]"
                    />
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TERC20RewardState } from '@thxnetwork/dashboard/store/modules/erc20Rewards';
import { RewardConditionPlatform, RewardConditionInteraction, TERC20Reward } from '@thxnetwork/types/index';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';
import type { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import BaseModalRewardERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC20Create.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModalRewardClaimsDownload from '@thxnetwork/dashboard/components/modals/BaseModalRewardClaimsDownload.vue';

@Component({
    components: {
        BaseModalRewardERC20Create,
        BaseBadgeRewardConditionPreview,
        BaseCardTableHeader,
        BaseModalRewardClaimsDownload,
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
    selectedItems: string[] = [];

    pools!: IPools;
    totals!: { [poolId: string]: number };
    erc20Rewards!: TERC20RewardState;
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
                claims: r.claims,
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

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listRewards();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? (this.rewardsByPage.map((r) => r.id) as string[]) : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onDelete(items: string[]) {
        for (const id of Object.values(items)) {
            this.$store.dispatch('erc20Rewards/delete', this.erc20Rewards[this.pool._id][id]);
        }
    }
}
</script>
