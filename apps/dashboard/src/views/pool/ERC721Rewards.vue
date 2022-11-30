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
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :rewards="erc721Rewards[pool._id]"
                :totals="totals"
                :selectedItems="selectedItems"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onSelectAll" />
                </template>
                <template #head(title)> Title </template>
                <template #head(progress)> Progress </template>
                <template #head(erc721metadataId)> Metadata </template>
                <template #head(rewardCondition)> Condition </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(erc721metadataId)="{ index, item }">
                    <BaseBadgeMetadataPreview :index="index" :erc721="erc721" :metadataId="item.erc721metadataId" />
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
                    <div class="text-center text-muted small">
                        {{ !item.progress.limit ? 'unlimited' : `${item.progress.limit}x limit` }}
                    </div>
                </template>
                <template #cell(claims)="{ item }">
                    <b-link v-b-modal="`modalRewardClaimsDownload${item.id}`"> Download </b-link>
                    <BaseModalRewardClaimsDownload
                        :id="`modalRewardClaimsDownload${item.id}`"
                        :pool="pool"
                        :selectedItems="[item.id]"
                        :rewards="erc721Rewards[pool._id]"
                    />
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
                        <b-dropdown-item
                            @click="$store.dispatch('erc721Rewards/delete', erc721Rewards[pool._id][item.id])"
                        >
                            Delete
                        </b-dropdown-item>
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
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';
import BaseBadgeMetadataPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeMetadataPreview.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import { RewardConditionPlatform, RewardConditionInteraction, TERC721Reward } from '@thxnetwork/types/index';
import { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';
import BaseModalRewardClaimsDownload from '@thxnetwork/dashboard/components/modals/BaseModalRewardClaimsDownload.vue';

@Component({
    components: {
        BaseModalRewardERC721Create,
        BaseBadgeMetadataPreview,
        BaseBadgeRewardConditionPreview,
        BaseModalRewardClaimsDownload,
        BaseCardTableHeader,
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
    selectedItems: string[] = [];

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
                claims: r.claims,
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

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('erc721Rewards/list', {
            page: this.page,
            limit: this.limit,
            pool: this.pool,
        });
        this.isLoading = false;
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listRewards();
    }

    onSelectAll(isSelectAll: boolean) {
        this.selectedItems = isSelectAll ? (this.rewardsByPage.map((r) => r.id) as string[]) : [];
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
