<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Surveys</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button v-b-modal="'modalRewardSurveysCreate'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">Survey Reward</span>
                </b-button>
                <BaseModalRewardSurveysCreate @submit="listRewards" :id="'modalRewardSurveysCreate'" :pool="pool" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="totals[pool._id]"
                :selectedItems="selectedItems"
                :actions="[{ variant: 0, label: `Delete survey rewards` }]"
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
                <template #head(amount)> Points </template>
                <template #head(description)> Description </template>

                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>
                <template #cell(title)="{ item }">
                    {{ item.title }}
                </template>
                <template #cell(amount)="{ item }">
                    <strong class="text-primary">{{ item.amount }} </strong>
                </template>
                <template #cell(questions)="{ item }">
                    <strong class="text-primary">{{ item.questions }} </strong>
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalRewardSurveysCreate' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item
                            @click="$store.dispatch('surveyRewards/delete', surveyRewards[pool._id][item.id])"
                        >
                            Delete
                        </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardSurveysCreate
                        @submit="listRewards"
                        :id="'modalRewardSurveysCreate' + item.id"
                        :pool="pool"
                        :reward="surveyRewards[pool._id][item.id]"
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
import { TSurveyRewardState } from '@thxnetwork/dashboard/store/modules/surveyRewards.js';
import { RewardConditionPlatform, RewardConditionInteraction, TSurveyReward } from '@thxnetwork/types/index';
import BaseModalRewardSurveysCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardSurveysCreate.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';

@Component({
    components: {
        BaseModalRewardSurveysCreate,
        BaseCardTableHeader,
        BaseBadgeRewardConditionPreview,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'surveyRewards/totals',
        surveyRewards: 'surveyRewards/all',
    }),
})
export default class SurveysView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    isLoading = true;
    limit = 5;
    page = 1;
    selectedItems: string[] = [];

    pools!: IPools;
    totals!: { [poolId: string]: number };
    surveyRewards!: TSurveyRewardState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get rewardsByPage() {
        if (!this.surveyRewards[this.$route.params.id]) return [];
        return Object.values(this.surveyRewards[this.$route.params.id])
            .sort((a, b) => {
                const createdAtTime = new Date(a.createdAt as string).getTime();
                const nextCreatedAtTime = new Date(b.createdAt as string).getTime();
                return createdAtTime < nextCreatedAtTime ? 1 : -1;
            })
            .filter((reward: TSurveyReward) => reward.page === this.page)
            .map((r: TSurveyReward) => ({
                checkbox: r._id,
                title: r.title,
                description: r.description,
                amount: r.amount,
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    async listRewards() {
        console.log('SONO QUI!');
        this.isLoading = true;
        await this.$store.dispatch('surveyRewards/list', { page: this.page, pool: this.pool });
        this.isLoading = false;
    }

    mounted() {
        this.listRewards();
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

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch('surveyRewards/delete', this.surveyRewards[this.pool._id][id]);
                }
                break;
        }
    }
}
</script>
