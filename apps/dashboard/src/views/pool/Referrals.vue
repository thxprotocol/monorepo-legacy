<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Referrals</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button v-b-modal="'modalReferralRewardCreate'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">Referral Reward</span>
                </b-button>
                <BaseModalReferralRewardCreate :id="'modalReferralRewardCreate'" :pool="pool" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="totals[pool._id]"
                :selectedItems="selectedItems"
                :actions="[{ variant: 0, label: `Delete referral rewards` }]"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #head(title)> Title </template>
                <template #head(amount)> Amount </template>
                <template #head(claims)> Claims </template>
                <template #head(successUrl)> Success URL </template>

                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(title)="{ item }">
                    {{ item.title }}
                </template>
                <template #cell(amount)="{ item }">
                    <b-badge variant="dark" class="p-2"> {{ item.amount }} Points </b-badge>
                </template>
                <template #cell(claims)="{ item }"
                    ><div>
                        <b-button v-if="item.claims" v-b-modal="'modalReferralRewardClaims' + item.id" variant="none">
                            {{ item.claims }} <i class="fas fa-eye" aria-hidden="true"></i>
                        </b-button>
                    </div>
                </template>
                <template #cell(successUrl)="{ item }">
                    {{ item.successUrl }}
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
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalReferralRewardCreate' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item
                            @click="$store.dispatch('referralRewards/delete', referralRewards[pool._id][item.id])"
                        >
                            Delete
                        </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalReferralRewardCreate
                        :id="'modalReferralRewardCreate' + item.id"
                        :pool="pool"
                        :reward="referralRewards[pool._id][item.id]"
                    />
                    <BaseModalReferralRewardClaims
                        :id="'modalReferralRewardClaims' + item.id"
                        :pool="pool"
                        :reward="referralRewards[pool._id][item.id]"
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
import BaseModalReferralRewardCreate from '@thxnetwork/dashboard/components/modals/BaseModalReferralRewardCreate.vue';
import BaseModalReferralRewardClaims from '@thxnetwork/dashboard/components/modals/BaseModelReferralRewardClaims.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { TRewardState } from '@thxnetwork/dashboard/store/modules/referralRewards';
import { TReferralReward } from '@thxnetwork/types/index';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';

@Component({
    components: {
        BaseNothingHere,
        BaseModalReferralRewardCreate,
        BaseModalReferralRewardClaims,
        BaseBadgeRewardConditionPreview,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'referralRewards/totals',
        referralRewards: 'referralRewards/all',
    }),
})
export default class ReferralRewardsView extends Vue {
    isLoading = true;
    limit = 5;
    page = 1;
    selectedItems: string[] = [];

    pools!: IPools;
    totals!: { [poolId: string]: number };
    referralRewards!: TRewardState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get rewardsByPage() {
        if (!this.referralRewards[this.$route.params.id]) return [];
        return Object.values(this.referralRewards[this.$route.params.id])
            .filter((reward: TReferralReward) => reward.page === this.page)
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: any) => ({
                checkbox: r._id,
                title: r.title,
                amount: r.amount,
                successUrl: r.successUrl,
                progress: {
                    limit: r.rewardLimit,
                    progress: r.progress,
                },
                claims: r.claims.length,
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
            .dispatch('referralRewards/list', {
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
            this.$store.dispatch('referralRewards/delete', this.referralRewards[this.pool._id][id]);
        }
    }

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch('referralRewards/delete', this.referralRewards[this.pool._id][id]);
                }
                break;
        }
    }
}
</script>
