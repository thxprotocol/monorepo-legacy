<template>
    <div>
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
                                    @input="onInputStartDate"
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
                                    @input="onInputEndDate"
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
                        <b-list-group class="mb-3">
                            <b-list-group-item
                                v-for="(metric, key) of [
                                    metrics.dailyQuest,
                                    metrics.inviteQuest,
                                    metrics.socialQuest,
                                    metrics.customQuest,
                                    metrics.web3Quest,
                                    metrics.gitcoinQuest,
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
                                <b-link :to="`/campaign/${pool._id}/quests`">All Quests</b-link>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                    <b-col md="8">
                        <BaseChartQuests :chart-dates="chartDates" />
                    </b-col>
                </b-row>
                <p><strong class="text-muted">Rewards</strong></p>
                <b-row class="mb-3" v-if="metrics">
                    <b-col md="4">
                        <b-list-group class="mb-3">
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
                                <b-link :to="`/campaign/${pool._id}/rewards`">All Rewards</b-link>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                    <b-col md="8">
                        <BaseChartRewards :chart-dates="chartDates" />
                    </b-col>
                </b-row>
            </b-col>
            <b-col md="4">
                <b-row>
                    <b-col>
                        <p><strong class="text-muted">Leaderboard</strong></p>
                        <BaseCardLeaderboard :pool="pool" :start-date="startDate" :end-date="endDate" />
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { fromWei } from 'web3-utils';
import { format } from 'date-fns';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseChartQuests from '@thxnetwork/dashboard/components/charts/BaseChartQuests.vue';
import BaseChartRewards from '@thxnetwork/dashboard/components/charts/BaseChartRewards.vue';
import BaseDateDuration from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';
import BaseCardLeaderboard from '@thxnetwork/dashboard/components/cards/BaseCardLeaderboard.vue';

const ONE_DAY = 86400000; // one day in ms
const startDate = new Date(Date.now() - ONE_DAY * 7);
const endDate = new Date();
endDate.setHours(23, 59, 59, 999);

@Component({
    components: {
        BaseIdenticon,
        BaseChartQuests,
        BaseChartRewards,
        BaseDateDuration,
        BaseCardLeaderboard,
    },
    computed: mapGetters({
        analyticsMetrics: 'pools/analyticsMetrics',
    }),
})
export default class ViewAnalyticsMetrics extends Vue {
    fromWei = fromWei;
    format = format;
    metricQuestsLabelMap = ['Daily', 'Invite', 'Social', 'Custom', 'Web3', 'Gitcoin'];
    metricQuestsInfoMap = [
        'Daily Quest qualifications versus completed and the total amount of points earned.',
        'Invite Quest leads qualified and the total amount of points earned.',
        'Social Quests completed and the total amount of points earned.',
        'Custom Quest qualifications versus completions and the total amount of points earned.',
        'Web3 Quests completed and the total amount of points earned.',
        'Gitcoin Quests completed and the total amount of points earned.',
    ];
    metricRewardLabelMap = ['Coin', 'NFT', 'Custom', 'Coupon', 'Discord Role'];
    isLoadingCharts = false;
    isLoadingMetrics = false;
    analyticsMetrics!: IPoolAnalyticsMetrics;
    defaultDates = {
        startDate,
        endDate,
    };
    startDate = startDate;
    endDate = endDate;

    @Prop() pool!: TPool;

    get metrics() {
        if (!this.analyticsMetrics[this.$route.params.id]) return null;
        return this.analyticsMetrics[this.$route.params.id];
    }

    get isLoading() {
        return this.isLoadingMetrics || this.isLoadingCharts;
    }

    get chartDates() {
        const oneDay = 86400000; // one day in milliseconds
        const dates: string[] = [];

        for (let i = 0; i <= this.endDate.getTime() - this.startDate.getTime(); ) {
            dates.push(format(new Date(this.startDate.getTime() + i), 'yyyy-MM-dd'));
            i += oneDay;
        }

        return dates;
    }

    async mounted() {
        this.getCharts();
        this.getMetrics();
    }

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
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

    onInputStartDate(startDate: Date) {
        this.startDate = startDate;
        this.update();
    }

    onInputEndDate(endDate: Date) {
        this.endDate = endDate;
        this.endDate.setHours(23, 59, 59, 999);
        this.update();
    }

    update() {
        this.getCharts();
        this.getMetrics();
    }
}
</script>
