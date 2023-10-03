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
                        :disabled="RewardVariant[variant] == RewardVariant.Custom && !hasPremiumAccess(pool.owner)"
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
            </b-col>
        </b-row>
        <BCard variant="white" fields="'index', 'checkbox'" body-class="p-0 shadow-sm">
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
            <BTable id="table-rewards" hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(index)> &nbsp; </template>
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #head(variant)> Variant </template>
                <template #head(pointPrice)> Price </template>
                <template #head(title)> Title </template>
                <template #head(supply)> Supply </template>
                <template #head(expiry)> Expiry </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(index)="{ item, index }">
                    <div class="btn btn-sort p-0">
                        <b-link block @click="onClickUp(item, index)">
                            <i class="fas fa-caret-up ml-0"></i>
                        </b-link>
                        <b-link block @click="onClickDown(item, index)">
                            <i class="fas fa-caret-down ml-0"></i>
                        </b-link>
                    </div>
                </template>
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="{ id: item.id, variant: item.variant }" v-model="selectedItems" />
                </template>
                <template #cell(pointPrice)="{ item }">
                    <strong class="text-primary">{{ item.pointPrice }} </strong>
                </template>
                <template #cell(variant)="{ item }">
                    <b-badge variant="light" class="p-2">{{ RewardVariant[item.variant] }} </b-badge>
                </template>
                <template #cell(amount)="{ item }">
                    <strong class="text-primary">{{ item.amount.amount }} {{ item.amount.symbol }}</strong>
                </template>
                <template #cell(supply)="{ item }">
                    <b-progress style="border-radius: 0.3rem">
                        <b-progress-bar
                            :label="
                                item.supply.limit
                                    ? `${item.supply.progress}/${item.supply.limit}`
                                    : String(item.supply.progress)
                            "
                            :value="item.supply.progress"
                            :min="0"
                            :max="item.supply.limit || item.supply.progress"
                        />
                    </b-progress>
                </template>
                <template #cell(title)="{ item }">
                    {{ item.title }}
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret right>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item
                            :disabled="item.variant !== RewardVariant.NFT"
                            v-b-modal="`modalRewardClaimsDownload${item.id}`"
                        >
                            QR Codes
                        </b-dropdown-item>
                        <b-dropdown-item v-b-modal="rewardModalComponentMap[item.variant] + item.id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickDelete(item)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardClaimsDownload
                        :id="`modalRewardClaimsDownload${item.id}`"
                        :pool="pool"
                        :selectedItems="[item.id]"
                        :rewards="allRewards.filter((r) => r.variant == RewardVariant.NFT)"
                    />
                    <component
                        @submit="listRewards"
                        :is="rewardModalComponentMap[item.variant]"
                        :id="rewardModalComponentMap[item.variant] + item.id"
                        :reward="allRewards.find((q) => q._id === item.id)"
                        :pool="pool"
                        :total="allRewards.length"
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
    TBasePerk,
    TCustomReward,
} from '@thxnetwork/types/index';
import type { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import BaseModalRewardERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC20Create.vue';
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';
import BaseModalRewardCustomCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCustomCreate.vue';
import BaseModalRewardCouponCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCouponCreate.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModalRewardClaimsDownload from '@thxnetwork/dashboard/components/modals/BaseModalRewardClaimsDownload.vue';
import { hasPremiumAccess } from '@thxnetwork/common';
import { type TCouponRewardState } from '@thxnetwork/dashboard/store/modules/couponRewards';
import { type TCustomRewardState } from '@thxnetwork/dashboard/store/modules/rewards';

@Component({
    components: {
        BaseModalRewardERC20Create,
        BaseModalRewardERC721Create,
        BaseModalRewardCustomCreate,
        BaseModalRewardCouponCreate,
        BaseBadgeRewardConditionPreview,
        BaseCardTableHeader,
        BaseModalRewardClaimsDownload,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc20Perks/totals',
        coinRewards: 'erc20Perks/all',
        nftRewards: 'erc721Perks/all',
        customRewards: 'rewards/all',
        couponRewards: 'couponRewards/all',
    }),
})
export default class RewardsView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    hasPremiumAccess = hasPremiumAccess;
    isLoading = true;
    limit = 10;
    page = 1;
    selectedItems: string[] = [];
    RewardVariant = RewardVariant;
    rewardModalComponentMap = {
        [RewardVariant.Coin]: 'BaseModalRewardERC20Create',
        [RewardVariant.NFT]: 'BaseModalRewardERC721Create',
        [RewardVariant.Custom]: 'BaseModalRewardCustomCreate',
        [RewardVariant.Coupon]: 'BaseModalRewardCouponCreate',
    };
    rewardIconClassMap = {
        [RewardVariant.Coin]: 'fas fa-coins',
        [RewardVariant.NFT]: 'fas fa-palette',
        [RewardVariant.Custom]: 'fas fa-gift',
        [RewardVariant.Coupon]: 'fas fa-tags',
    };

    pools!: IPools;
    totals!: { [poolId: string]: number };

    coinRewards!: TERC20PerkState;
    nftRewards!: TERC721RewardState;
    customRewards!: TCustomRewardState;
    couponRewards!: TCouponRewardState;

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
            ...(this.couponRewards[this.$route.params.id]
                ? Object.values(this.couponRewards[this.$route.params.id])
                : []),
            ...(this.customRewards[this.$route.params.id]
                ? Object.values(this.customRewards[this.$route.params.id])
                : []),
        ];
    }

    get rewardsByPage() {
        return this.allRewards
            .filter((reward: TERC20Perk | TERC721Perk | TCustomReward | any) => reward.page === this.page)
            .sort((a: any, b: any) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: any) => ({
                index: 0,
                checkbox: r._id,
                variant: r.variant,
                pointPrice: r.pointPrice,
                title: r.title,
                expiry: r.expiry,
                supply: { progress: r.payments ? r.payments.length : 0, limit: r.limit },
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    mounted() {
        this.listRewards();
    }

    onClickUp({ index }: { index: TBasePerk }, i: number) {
        //
    }

    onClickDown({ index }: { index: TBasePerk }, i: number) {
        //
    }

    async listRewards() {
        this.isLoading = true;
        // Call new API endpoint that returns all reward including the variant enum
        await Promise.all([
            this.$store.dispatch('erc20Perks/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('erc721Perks/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('rewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('couponRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
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
                return this.$store.dispatch('erc20Perks/delete', this.coinRewards[this.pool._id][item.id]);
            case RewardVariant.NFT:
                return this.$store.dispatch('erc721Perks/delete', this.nftRewards[this.pool._id][item.id]);
            case RewardVariant.Custom:
                return this.$store.dispatch('rewards/delete', this.customRewards[this.pool._id][item.id]);
            case RewardVariant.Coupon:
                return this.$store.dispatch('couponRewards/delete', this.couponRewards[this.pool._id][item.id]);
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
<style lang="scss">
#table-rewards tr:first-child .btn-sort a:first-child,
#table-rewards tr:last-child .btn-sort a:last-child {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--gray) !important;
}
#table-rewards th:nth-child(1) {
    width: 20px;
}
#table-rewards th:nth-child(2) {
    width: 40px;
}
#table-rewards th:nth-child(3) {
    width: 100px;
}
#table-rewards th:nth-child(4) {
    width: 100px;
}
#table-rewards th:nth-child(5) {
    width: auto;
}
#table-rewards th:nth-child(6) {
    width: 100px;
}
#table-rewards th:nth-child(8) {
    width: 100px;
}
</style>
