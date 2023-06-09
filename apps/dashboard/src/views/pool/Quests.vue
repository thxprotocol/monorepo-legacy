<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Quests</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-dropdown no-caret variant="primary" toggle-class="rounded-pill">
                    <template #button-content>
                        <i class="fas fa-plus mr-2 ml-0"></i>
                        New Quest
                    </template>
                    <b-dropdown-item-button
                        v-for="(variant, key) of Object.keys(QuestVariant).filter((v) => isNaN(Number(v)))"
                        :key="key"
                        v-b-modal="questModalComponentMap[QuestVariant[variant]]"
                        button-class="d-flex"
                    >
                        <div style="width: 30px">
                            <i
                                class="text-muted mr-2"
                                :class="questIconClassMap[QuestVariant[variant]]"
                                aria-hidden="true"
                            ></i>
                        </div>
                        {{ variant }}
                        <component
                            @submit="listQuests"
                            :is="questModalComponentMap[QuestVariant[variant]]"
                            :id="questModalComponentMap[QuestVariant[variant]]"
                            :pool="pool"
                        />
                    </b-dropdown-item-button>
                </b-dropdown>
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="totals[pool._id]"
                :selectedItems="selectedItems"
                :actions="[{ variant: 0, label: `Delete quests` }]"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #cell(variant)="{ item }">
                    <b-badge variant="light" class="p-2">{{ QuestVariant[item.variant] }} </b-badge>
                </template>
                <template #head(title)> Title </template>
                <template #head(claims)> Completed </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="{ id: item.id, variant: item.variant }" v-model="selectedItems" />
                </template>
                <template #cell(points)="{ item }">
                    <strong class="text-primary">{{ item.points }} </strong>
                </template>
                <template #cell(title)="{ item }">
                    {{ item.title }}
                </template>
                <template #cell(claims)="{ item }">
                    <template v-if="item.variant === QuestVariant.Referral">
                        <b-link v-b-modal="`modalReferralQuestClaims${item.id}`">
                            {{ item.claims.length }}
                        </b-link>
                        <BaseModalReferralRewardClaims
                            :id="`modalReferralQuestClaims${item.id}`"
                            :pool="pool"
                            :reward="allQuests.find((q) => q._id === item.id)"
                        />
                    </template>
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="questModalComponentMap[item.variant] + item.id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickDelete(item)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <component
                        @submit="listQuests"
                        :is="questModalComponentMap[item.variant]"
                        :id="questModalComponentMap[item.variant] + item.id"
                        :pool="pool"
                        :reward="allQuests.find((q) => q._id === item.id)"
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
import { QuestVariant, TDailyReward, TMilestoneReward, TPointReward, TReferralReward } from '@thxnetwork/types/index';
import BaseModalRewardDailyCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardDailyCreate.vue';
import BaseModalRewardPointsCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardPointsCreate.vue';
import BaseModalRewardReferralCreate from '@thxnetwork/dashboard/components/modals/BaseModalReferralRewardCreate.vue';
import BaseModalRewardMilestoneCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardMilestonesCreate.vue';
import BaseModalReferralRewardClaims from '@thxnetwork/dashboard/components/modals/BaseModalReferralRewardClaims.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import { TDailyRewardState } from '@thxnetwork/dashboard/store/modules/dailyRewards';
import { TPointRewardState } from '@thxnetwork/dashboard/store/modules/pointRewards';
import { TReferralRewardState } from '@thxnetwork/dashboard/store/modules/referralRewards';
import { TMilestoneRewardState } from '@thxnetwork/dashboard/store/modules/milestoneRewards';

@Component({
    components: {
        BaseCardTableHeader,
        BaseModalRewardDailyCreate,
        BaseModalRewardPointsCreate,
        BaseModalRewardReferralCreate,
        BaseModalRewardMilestoneCreate,
        BaseModalReferralRewardClaims,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'dailyRewards/totals',
        dailyRewards: 'dailyRewards/all',
        pointRewards: 'pointRewards/all',
        milestoneRewards: 'milestoneRewards/all',
        referralRewards: 'referralRewards/all',
    }),
})
export default class AssetPoolView extends Vue {
    isLoading = true;
    limit = 50;
    page = 1;
    selectedItems: { variant: QuestVariant; id: string }[] = [];
    QuestVariant = QuestVariant;
    questModalComponentMap = {
        [QuestVariant.Daily]: 'BaseModalRewardDailyCreate',
        [QuestVariant.Referral]: 'BaseModalRewardReferralCreate',
        [QuestVariant.Social]: 'BaseModalRewardPointsCreate',
        [QuestVariant.Custom]: 'BaseModalRewardMilestoneCreate',
    };
    questIconClassMap = {
        [QuestVariant.Daily]: 'fas fa-calendar',
        [QuestVariant.Referral]: 'fas fa-comments',
        [QuestVariant.Social]: 'fas fa-trophy',
        [QuestVariant.Custom]: 'fas fa-flag',
    };

    pools!: IPools;
    totals!: { [poolId: string]: number };

    dailyRewards!: TDailyRewardState;
    referralRewards!: TReferralRewardState;
    pointRewards!: TPointRewardState;
    milestoneRewards!: TMilestoneRewardState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get allQuests() {
        return [
            ...(this.dailyRewards[this.$route.params.id]
                ? Object.values(this.dailyRewards[this.$route.params.id])
                : []),
            ...(this.referralRewards[this.$route.params.id]
                ? Object.values(this.referralRewards[this.$route.params.id])
                : []),
            ...(this.pointRewards[this.$route.params.id]
                ? Object.values(this.pointRewards[this.$route.params.id])
                : []),
            ...(this.milestoneRewards[this.$route.params.id]
                ? Object.values(this.milestoneRewards[this.$route.params.id])
                : []),
        ];
    }

    get rewardsByPage() {
        return this.allQuests
            .sort((a, b) => {
                const createdAtTime = new Date(a.createdAt as string).getTime();
                const nextCreatedAtTime = new Date(b.createdAt as string).getTime();
                return createdAtTime < nextCreatedAtTime ? 1 : -1;
            })
            .filter(
                (reward: TDailyReward | TPointReward | TReferralReward | TMilestoneReward) => reward.page === this.page,
            )
            .map((r: any) => ({
                checkbox: r._id,
                variant: r.variant,
                points: r.amount || `${r.amounts.length} days`,
                title: r.title,
                claims: r.claims,
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    async listQuests() {
        this.isLoading = true;
        await Promise.all([
            this.$store.dispatch('dailyRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('pointRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('milestoneRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('referralRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
        ]);
        this.isLoading = false;
    }

    mounted() {
        this.listQuests();
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listQuests();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked
            ? (this.rewardsByPage.map((r) => {
                  return { id: r.id, variant: r.variant };
              }) as { variant: QuestVariant; id: string }[])
            : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listQuests();
    }

    onDelete(items: string[]) {
        for (const id of Object.values(items)) {
            this.$store.dispatch('dailyRewards/delete', this.dailyRewards[this.pool._id][id]);
        }
    }
    onClickDelete(item: { variant: QuestVariant; id: string }) {
        switch (item.variant) {
            case QuestVariant.Daily:
                return this.$store.dispatch('dailyRewards/delete', this.dailyRewards[this.pool._id][item.id]);
            case QuestVariant.Referral:
                return this.$store.dispatch('referralRewards/delete', this.referralRewards[this.pool._id][item.id]);
            case QuestVariant.Social:
                return this.$store.dispatch('pointRewards/delete', this.pointRewards[this.pool._id][item.id]);
            case QuestVariant.Custom:
                return this.$store.dispatch('milestoneRewards/delete', this.milestoneRewards[this.pool._id][item.id]);
        }
    }

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const item of Object.values(this.selectedItems)) {
                    this.onClickDelete(item);
                }
        }
    }
}
</script>

<style>
.table th:nth-child(1) {
    width: 50px;
}
.table th:nth-child(2) {
    width: 100px;
}
.table th:nth-child(3) {
    width: 100px;
}
.table th:nth-child(4) {
    width: auto;
}
.table th:nth-child(5) {
    width: 120px;
}
.table th:nth-child(6) {
    width: 40px;
}
</style>
