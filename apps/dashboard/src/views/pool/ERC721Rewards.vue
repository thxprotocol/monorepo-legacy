<template>
    <div>
        <b-row class="mb-3">
            <b-col md="9" class="d-flex align-items-center">
                <h2 class="mb-0 mr-2">ERC721 Rewards</h2>
            </b-col>
            <b-col md="3" class="d-flex justify-content-end">
                <b-button v-b-modal="'modalRewardERC721Create'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">ERC721 Reward</span>
                </b-button>
                <BaseModalRewardERC721Create :id="'modalRewardERC721Create'" :pool="pool" @submit="onSubmit" />
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
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="sm">
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #head(title)> Title </template>
                <template #head(progress)> Progress </template>
                <template #head(erc721metadataId)> Metadata </template>
                <template #head(rewardCondition)> Condition </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selected" />
                </template>
                <template #cell(erc721metadataId)="{ index, item }">
                    <BaseBadgeMetadataPreview
                        v-if="erc721.metadata && erc721.metadata[item.erc721metadataId]"
                        :index="index"
                        :metadata="erc721.metadata[item.erc721metadataId]"
                    />
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
                        <b-dropdown-item v-b-modal="'modalRewardERC721Create' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item disabled>Delete</b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardERC721Create
                        :id="'modalRewardERC721Create' + item.id"
                        :pool="pool"
                        :reward="erc721Rewards[pool._id][item.id]"
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
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';
import BaseCardReward from '@thxnetwork/dashboard/components/list-items/BaseListItemReward.vue';
import BaseBadgeMetadataPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeMetadataPreview.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import { RewardConditionPlatform, RewardConditionInteraction, TERC721Reward } from '@thxnetwork/types/index';
import { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';

@Component({
    components: {
        BaseModalRewardERC721Create,
        BaseBadgeMetadataPreview,
        BaseBadgeRewardConditionPreview,
        BaseCardReward,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc721Rewards/totals',
        erc721s: 'erc721/all',
        erc721Rewards: 'erc721Rewards/all',
    }),
})
export default class ERC721RewardsView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    isLoading = true;
    limit = 10;
    page = 1;
    selected: string[] = [];

    pools!: IPools;
    erc721s!: IERC721s;
    totals!: { [poolId: string]: number };
    erc721Rewards!: { [poolId: string]: { [id: string]: TERC721Reward } };

    get erc721(): TERC721 {
        return this.erc721s[this.pool.erc721._id];
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get rewardsByPage() {
        if (!this.erc721Rewards[this.$route.params.id]) return [];
        return Object.values(this.erc721Rewards[this.$route.params.id])
            .filter((reward: TERC721Reward) => reward.page === this.page)
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TERC721Reward) => ({
                checkbox: r._id,
                erc721metadataId: r.erc721metadataId,
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
        this.$store.dispatch('erc721/read', this.pool.erc721._id).then(async () => {
            await this.$store.dispatch('erc721/listMetadata', {
                erc721: this.pool.erc721,
                page: this.page,
                limit: this.limit,
            });
        });
    }

    listRewards() {
        this.isLoading = true;
        this.$store
            .dispatch('erc721Rewards/list', {
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
