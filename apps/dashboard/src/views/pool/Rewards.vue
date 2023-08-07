<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Rewards</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-dropdown no-caret variant="primary" toggle-class="rounded-pill">
                    <template #button-content>
                        <i class="fas fa-plus mr-2 ml-0"></i>
                        New Reward
                    </template>
                    <b-dropdown-item-button
                        v-for="(variant, key) of Object.keys(RewardVariant).filter((v) => isNaN(Number(v)))"
                        :key="key"
                        v-b-modal="rewardModalComponentMap[RewardVariant[variant]]"
                        button-class="d-flex"
                    >
                        <div style="width: 30px">
                            <i
                                class="text-muted mr-2"
                                :class="rewardIconClassMap[RewardVariant[variant]]"
                                aria-hidden="true"
                            ></i>
                        </div>
                        {{ variant }}
                        <component
                            @submit="listRewards"
                            :is="rewardModalComponentMap[RewardVariant[variant]]"
                            :id="rewardModalComponentMap[RewardVariant[variant]]"
                            :total="allRewards.length"
                            :pool="pool"
                        />
                    </b-dropdown-item-button>
                </b-dropdown>
                <BaseModalRewardERC20Create @submit="listRewards" :id="'modalRewardERC20Create'" :pool="pool" />
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
                    { variant: 0, label: `Delete rewards` },
                    { variant: 1, label: 'Export Claim URL\'s' },
                ]"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BaseModalRewardClaimsDownload
                id="modalRewardClaimsDownload"
                :pool="pool"
                :selectedItems="selectedItems"
                :rewards="coinRewards[pool._id]"
            />
            <BTable id="table-coin-perks" hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #head(title)> Title </template>
                <template #head(progress)> Progress </template>
                <template #head(rewardCondition)> Condition </template>
                <template #head(claims)> Claim URL's </template>
                <template #head(limit)> Reward Limit </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(amount)="{ item }">
                    <strong class="text-primary">{{ item.amount.amount }} {{ item.amount.symbol }}</strong>
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
                    <b-link v-b-modal="`modalRewardClaimsDownload${item.id}`" v-if="item.claims.length">
                        <b-progress
                            :value="item.claims.filter((c) => c.sub).length"
                            :max="item.claims.length"
                            show-value
                        />
                    </b-link>
                    <BaseModalRewardClaimsDownload
                        :id="`modalRewardClaimsDownload${item.id}`"
                        :pool="pool"
                        :selectedItems="[item.id]"
                        :rewards="coinRewards[pool._id]"
                    />
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret right>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="rewardModalComponentMap[item.variant] + item.id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickDelete(item)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <component
                        @submit="listRewards"
                        :is="rewardModalComponentMap[item.variant]"
                        :id="rewardModalComponentMap[item.variant] + item.id"
                        :pool="pool"
                        :total="allRewards.length"
                        :perk="allRewards.find((q) => q._id === item.id)"
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
import { TERC20PerkState } from '@thxnetwork/dashboard/store/modules/erc20Perks';
import { TERC721RewardState } from '@thxnetwork/dashboard/store/modules/erc721Perks';
import {
    RewardConditionPlatform,
    RewardConditionInteraction,
    TERC20Perk,
    RewardVariant,
    TERC721Perk,
} from '@thxnetwork/types/index';
import type { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import BaseModalRewardERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC20Create.vue';
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModalRewardClaimsDownload from '@thxnetwork/dashboard/components/modals/BaseModalRewardClaimsDownload.vue';

@Component({
    components: {
        BaseModalRewardERC20Create,
        BaseModalRewardERC721Create,
        BaseBadgeRewardConditionPreview,
        BaseCardTableHeader,
        BaseModalRewardClaimsDownload,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc20Perks/totals',
        coinRewards: 'erc20Perks/all',
        nftRewards: 'erc721Perks/all',
    }),
})
export default class RewardsView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    isLoading = true;
    limit = 10;
    page = 1;
    selectedItems: string[] = [];
    RewardVariant = RewardVariant;
    rewardModalComponentMap = {
        [RewardVariant.Coin]: 'BaseModalRewardERC20Create',
        [RewardVariant.NFT]: 'BaseModalRewardERC721Create',
        // [RewardVariant.Custom]: 'BaseModalRewardCustomCreate',
    };
    rewardIconClassMap = {
        [RewardVariant.Coin]: 'fas fa-coins',
        [RewardVariant.NFT]: 'fas fa-palette',
        // [RewardVariant.Custom]: 'fas fa-gift',
    };

    pools!: IPools;
    totals!: { [poolId: string]: number };

    coinRewards!: TERC20PerkState;
    nftRewards!: TERC721RewardState;
    // customRewards!: TCustomRewardState;

    erc721s!: IERC721s;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get allRewards() {
        return [
            ...(this.coinRewards[this.$route.params.id] ? Object.values(this.coinRewards[this.$route.params.id]) : []),
            ...(this.nftRewards[this.$route.params.id] ? Object.values(this.nftRewards[this.$route.params.id]) : []),
        ];
    }

    get rewardsByPage() {
        return this.allRewards
            .filter((reward: TERC20Perk | TERC721Perk | any) => reward.page === this.page)
            .sort((a: any, b: any) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: any) => ({
                checkbox: r._id,
                title: r.title,
                id: r._id,
                // amount: {
                //     amount: r.amount,
                //     symbol: r.erc20.symbol,
                // },
                // limit: r.limit,
            }))
            .slice(0, this.limit);
    }

    mounted() {
        this.listRewards();
    }

    async listRewards() {
        this.isLoading = true;
        await Promise.all([
            this.$store.dispatch('erc20Perks/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('erc721Perks/list', { page: this.page, pool: this.pool, limit: this.limit }),
        ]);
        this.isLoading = false;
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

    onClickDelete(item: { variant: RewardVariant; id: string }) {
        switch (item.variant) {
            case RewardVariant.Coin:
                return this.$store.dispatch('erc20Rewards/delete', this.coinRewards[this.pool._id][item.id]);
            case RewardVariant.NFT:
                return this.$store.dispatch('erc721Rewards/delete', this.nftRewards[this.pool._id][item.id]);
        }
    }

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch('coinRewards/delete', this.coinRewards[this.pool._id][id]);
                }
                break;
        }
    }
}
</script>
<style>
#table-coin-perks th:nth-child(1) {
    width: 50px;
}
#table-coin-perks th:nth-child(2) {
    width: 100px;
}
#table-coin-perks th:nth-child(3) {
    width: 100px;
}
#table-coin-perks th:nth-child(4) {
    width: 120px;
}
#table-coin-perks th:nth-child(5) {
    width: auto;
}
#table-coin-perks th:nth-child(6) {
    width: 120px;
}
#table-coin-perks th:nth-child(7) {
    width: 40px;
}
</style>
