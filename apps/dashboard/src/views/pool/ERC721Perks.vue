<template>
    <div>
        <b-row class="mb-3">
            <b-col md="9" class="d-flex align-items-center">
                <h2 class="mb-0 mr-2">NFT Perks</h2>
            </b-col>
            <b-col md="3" class="d-flex justify-content-end">
                <b-button v-b-modal="'modalRewardERC721Create'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">ERC721 Perk</span>
                </b-button>
                <BaseModalRewardERC721Create @submit="listRewards" :id="'modalRewardERC721Create'" :pool="pool" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="totals[pool._id]"
                :selectedItems="selectedItems"
                :actions="[
                    { variant: 0, label: `Delete perks` },
                    { variant: 1, label: 'Download QR codes' },
                    { variant: 2, label: 'Download CSV' },
                ]"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BaseModalRewardClaimsDownload
                id="modalRewardClaimsDownload"
                :pool="pool"
                :selectedItems="selectedItems"
                :rewards="erc721Perks[pool._id]"
            />
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onSelectAll" />
                </template>
                <template #head(title)> Title </template>
                <template #head(erc721metadataId)> Metadata </template>
                <template #head(rewardCondition)> Condition </template>
                <template #head(progress)> Progress </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(metadata)="{ index, item }">
                    <BaseBadgeMetadataPreview
                        :index="index"
                        :erc721Id="item.metadata.erc721Id"
                        :metadataId="item.metadata.metadataId"
                    />
                </template>
                <!-- <template #cell(progress)="{ item }">
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
                </template> -->
                <template #cell(claims)="{ item }">
                    <b-link v-b-modal="`modalRewardClaimsDownload${item.id}`"> Download </b-link>
                    <BaseModalRewardClaimsDownload
                        :id="`modalRewardClaimsDownload${item.id}`"
                        :pool="pool"
                        :selectedItems="[item.id]"
                        :rewards="erc721Perks[pool._id]"
                    />
                </template>
                <template #cell(rewardCondition)="{ item }">
                    <BaseBadgeRewardConditionPreview
                        v-if="item.rewardCondition.platform.type !== RewardConditionPlatform.None"
                        :rewardCondition="item.rewardCondition"
                    />
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalRewardERC721Create' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item @click="$store.dispatch('erc721Perks/delete', erc721Perks[pool._id][item.id])">
                            Delete
                        </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardERC721Create
                        @submit="listRewards"
                        :id="'modalRewardERC721Create' + item.id"
                        :pool="pool"
                        :reward="erc721Perks[pool._id][item.id]"
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
import { RewardConditionPlatform, RewardConditionInteraction, TERC721Perk } from '@thxnetwork/types/index';
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
        totals: 'erc721Perks/totals',
        erc721s: 'erc721/all',
        erc721Perks: 'erc721Perks/all',
    }),
})
export default class ERC721PerksView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    isLoading = true;
    limit = 10;
    page = 1;
    selectedItems: string[] = [];

    pools!: IPools;
    erc721s!: IERC721s;
    totals!: { [poolId: string]: number };
    erc721Perks!: { [poolId: string]: { [id: string]: TERC721Perk & { erc721: TERC721 } } };

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get rewardsByPage() {
        if (!this.erc721Perks[this.$route.params.id]) return [];
        return Object.values(this.erc721Perks[this.$route.params.id])
            .filter((reward: TERC721Perk) => reward.page === this.page)
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TERC721Perk & { erc721: TERC721 }) => ({
                checkbox: r._id,
                metadata: {
                    erc721Id: r.erc721Id,
                    metadataId: r.erc721metadataId,
                },
                title: r.title,
                rewardCondition: {
                    platform: platformList.find((p) => r.platform === p.type),
                    interaction: platformInteractionList.find((i) => r.interaction === i.type),
                    content: r.content,
                },
                // progress: {
                //     limit: r.rewardLimit,
                //     progress: r.progress,
                // },
                claims: r.claims,
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    async mounted() {
        await this.listRewards();
    }

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('erc721Perks/list', {
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

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch('erc721Perks/delete', this.erc721Perks[this.pool._id][id]);
                }
                break;
            case 1:
                this.$bvModal.show('modalRewardClaimsDownload');
            case 2:
                this.$bvModal.show('modalRewardClaimsDownload');
                break;
        }
    }
}
</script>
