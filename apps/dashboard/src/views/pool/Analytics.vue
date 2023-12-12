<template>
    <div class="mb-3">
        <b-row class="d-flex justify-content-between">
            <b-col class="">
                <h2 class="mb-3">Analytics</h2>
            </b-col>
            <b-col md="6" class="d-flex">
                <b-card body-class="p-2" class="ml-auto mb-3">
                    <b-row>
                        <b-col class="d-flex align-items-center justify-content-end">
                            <span class="mr-2">Start</span>
                            <b-input-group size="sm" style="min-width: 200px">
                                <b-datepicker
                                    size="sm"
                                    value-as-date
                                    :date-format-options="{
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                        weekday: 'short',
                                    }"
                                    :max="endDate"
                                    bg-variant="primary"
                                    v-model="startDate"
                                    @input="onInputDate"
                                />
                                <b-input-group-append>
                                    <b-button @click="startDate = defaultDates.startDate" variant="dark">
                                        <i class="fas fa-trash ml-0"></i>
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </b-col>
                        <b-col class="d-flex align-items-center justify-content-end ml-3">
                            <span class="mr-2">End</span>
                            <b-input-group size="sm" style="min-width: 200px">
                                <b-datepicker
                                    size="sm"
                                    value-as-date
                                    :date-format-options="{
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                        weekday: 'short',
                                    }"
                                    :min="startDate"
                                    :max="defaultDates.endDate"
                                    v-model="endDate"
                                    @input="onInputDate"
                                />
                                <b-input-group-append>
                                    <b-button @click="endDate = defaultDates.endDate" variant="dark">
                                        <i class="fas fa-trash ml-0"></i>
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
        <b-row v-if="pool">
            <b-col md="8">
                <p><strong class="text-muted">Campaign</strong></p>
                <b-row class="mb-3" v-if="metrics">
                    <b-col md="6">
                        <b-card bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                            <div class="text-gray d-flex align-content-between">
                                Participants
                                <b-link
                                    v-b-tooltip
                                    title="Authenticated users that visited your campaign."
                                    class="ml-auto"
                                >
                                    <i class="fas fa-question-circle"></i>
                                </b-link>
                            </div>
                            <div class="h2 mb-0">{{ metrics.participantCount }}</div>
                            <small>{{ metrics.participantActiveCount }} completed quests</small>
                        </b-card>
                    </b-col>
                    <b-col md="6">
                        <b-card bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                            <div class="text-gray d-flex align-content-between">
                                Subscribers
                                <b-link
                                    v-b-tooltip
                                    title="Participants that subscribed for new quests."
                                    class="ml-auto"
                                >
                                    <i class="fas fa-question-circle"></i>
                                </b-link>
                            </div>
                            <div class="h2 mb-0">
                                {{
                                    metrics.subscriptionCount > 0
                                        ? ((metrics.subscriptionCount / metrics.participantCount) * 100).toFixed(2)
                                        : 0
                                }}%
                            </div>
                            <small>{{ metrics.subscriptionCount }} participants subscribed</small>
                        </b-card>
                    </b-col>
                </b-row>
                <p><strong class="text-muted">Quests</strong></p>
                <b-row class="mb-3" v-if="metrics">
                    <b-col md="4">
                        <b-list-group class="mb-3" v-if="leaderboard.results.length">
                            <b-list-group-item
                                v-for="(metric, key) of [
                                    metrics.dailyQuest,
                                    metrics.inviteQuest,
                                    metrics.socialQuest,
                                    metrics.customQuest,
                                    metrics.web3Quest,
                                ]"
                                :key="key"
                                class="d-flex justify-content-between align-items-center pl-3"
                            >
                                <div class="d-flex align-items-center flex-grow">
                                    <div>{{ metricQuestsLabelMap[key] }}<br /></div>
                                </div>
                                <div class="font-weight-bold text-right">
                                    {{ metric.totalCreated }}
                                    {{ [0, 3].includes(key) ? `/${metric.totalCompleted}` : '' }}
                                    <b-link
                                        v-b-tooltip
                                        :title="`${metricQuestsInfoMap[key]} (${metric.totalAmount} points)`"
                                        class="ml-2"
                                    >
                                        <i class="fas fa-question-circle"></i>
                                    </b-link>
                                </div>
                            </b-list-group-item>
                            <b-list-group-item>
                                <b-link :to="`/pool/${pool._id}/quests`">All Quests</b-link>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                    <b-col md="8">
                        <BaseChartQuests :start-date="startDate" :end-date="endDate" />
                    </b-col>
                </b-row>
                <p><strong class="text-muted">Rewards</strong></p>
                <b-row class="mb-3" v-if="metrics">
                    <b-col md="4">
                        <b-list-group class="mb-3" v-if="leaderboard.results.length">
                            <b-list-group-item
                                v-for="(metric, key) of [
                                    metrics.coinReward,
                                    metrics.nftReward,
                                    metrics.customReward,
                                    metrics.couponReward,
                                    metrics.discordRoleReward,
                                ]"
                                :key="key"
                                class="d-flex justify-content-between align-items-center pl-3"
                            >
                                <div class="d-flex align-items-center flex-grow">
                                    <div>{{ metricRewardLabelMap[key] }}<br /></div>
                                </div>
                                <div class="font-weight-bold text-right">
                                    {{ metric.totalCreated }}
                                    <b-link
                                        v-b-tooltip
                                        :title="`${metric.totalAmount} points spend on this reward.`"
                                        class="ml-2"
                                    >
                                        <i class="fas fa-question-circle"></i>
                                    </b-link>
                                </div>
                            </b-list-group-item>
                            <b-list-group-item>
                                <b-link :to="`/pool/${pool._id}/rewards`">All Rewards</b-link>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                    <b-col md="8">
                        <BaseChartRewards :start-date="startDate" :end-date="endDate" />
                    </b-col>
                </b-row>
            </b-col>
            <b-col md="4">
                <b-row>
                    <b-col>
                        <p><strong class="text-muted">Leaderboard</strong></p>
                        <b-list-group class="mb-3" v-if="leaderboard.results.length">
                            <b-list-group-item
                                v-for="(result, key) of leaderboard.results"
                                :key="key"
                                class="d-flex justify-content-between align-items-center pl-3"
                            >
                                <div class="d-flex center-center">
                                    <div class="mr-3 text-gray">#{{ result.rank }}</div>
                                    <b-avatar size="25" variant="light" :src="result.account.profileImg" class="mr-3" />
                                    <div>
                                        {{ result.account.username }}
                                        <sup
                                            v-if="result.subscription"
                                            v-b-tooltip
                                            :title="`Subscribed since ${format(
                                                new Date(result.subscription.createdAt),
                                                'dd-MM-yyyy HH:mm',
                                            )}`"
                                        >
                                            <i class="fa fa-star text-primary" style="font-size: 0.8rem" />
                                        </sup>
                                    </div>
                                </div>
                                <div class="ml-auto text-right">
                                    <strong class="text-primary"> {{ result.questEntryCount }} </strong>
                                    <i class="fa fa-tasks text-primary" style="font-size: 0.8rem" />
                                </div>
                                <div style="min-width: 75px" class="text-right">
                                    <strong class="text-primary"> {{ result.score }} </strong>
                                </div>
                            </b-list-group-item>
                            <b-list-group-item>
                                <b-link :to="`/pool/${pool._id}/participants`">All Participants</b-link>
                            </b-list-group-item>
                        </b-list-group>
                        <p v-else class="text-gray">Could not find any campaign participants yet!</p>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { fromWei } from 'web3-utils';
import { format } from 'date-fns';
import { IPoolAnalyticsMetrics, IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseChartQuests from '@thxnetwork/dashboard/components/charts/BaseChartQuests.vue';
import BaseChartRewards from '@thxnetwork/dashboard/components/charts/BaseChartRewards.vue';
import BaseDateDuration from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';

const ONE_DAY = 86400000; // one day in milliseconds
const defaultDates = {
    startDate: new Date(Date.now() - ONE_DAY * 7),
    endDate: new Date(),
};

@Component({
    components: {
        BaseIdenticon,
        BaseChartQuests,
        BaseChartRewards,
        BaseDateDuration,
    },
    computed: mapGetters({
        pools: 'pools/all',
        analyticsMetrics: 'pools/analyticsMetrics',
    }),
})
export default class ViewAnalyticsMetrics extends Vue {
    fromWei = fromWei;
    format = format;
    metricQuestsLabelMap = ['Daily', 'Invite', 'Social', 'Custom', 'Web3'];
    metricQuestsInfoMap = [
        'Daily Quest qualifications versus completed and the total amount of points earned.',
        'Invite Quest leads qualified and the total amount of points earned.',
        'Social Quests completed and the total amount of points earned.',
        'Custom Quest qualifications versus completions and the total amount of points earned.',
        'Web3 Quests completed and the total amount of points earned.',
    ];
    metricRewardLabelMap = ['Coin', 'NFT', 'Custom', 'Coupon', 'Discord Role'];
    pools!: IPools;
    isLoadingLeaderboard = false;
    isLoadingCharts = false;
    isLoadingMetrics = false;
    leaderboard: { total: number; results: any[] } = {
        total: 0,
        results: [],
    };
    analyticsMetrics!: IPoolAnalyticsMetrics;
    defaultDates = defaultDates;
    startDate = defaultDates.startDate;
    endDate = defaultDates.endDate;

    get metrics() {
        if (!this.analyticsMetrics[this.$route.params.id]) return null;
        return this.analyticsMetrics[this.$route.params.id];
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isLoading() {
        return this.isLoadingMetrics || this.isLoadingCharts;
    }

    async mounted() {
        await this.$store.dispatch('pools/read', this.$route.params.id);
        this.getLeaderboard();
        this.getMetrics();
        this.getCharts();
    }

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    async getLeaderboard() {
        this.isLoadingLeaderboard = true;
        this.leaderboard = await this.$store.dispatch('pools/participants', {
            pool: this.pool,
            page: 1,
            limit: 10,
        });
        this.isLoadingLeaderboard = false;
    }

    async getMetrics() {
        this.isLoadingMetrics = true;
        await this.$store.dispatch('pools/readAnalyticsMetrics', {
            poolId: this.pool._id,
            startDate: this.startDate,
            endDate: this.endDate,
        });
        this.isLoadingMetrics = false;
    }

    async getCharts() {
        this.isLoadingCharts = true;
        await this.$store.dispatch('pools/readAnalytics', {
            poolId: this.pool._id,
            startDate: this.startDate,
            endDate: this.endDate,
        });
        this.isLoadingCharts = false;
    }

    onInputDate() {
        this.getCharts();
        this.getMetrics();
    }
}
</script>
