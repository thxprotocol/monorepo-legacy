<template>
    <b-row class="mt-3">
        <b-col md="8">
            <strong class="text-muted">Quests</strong>
            <b-card class="mt-3">
                <b-skeleton-wrapper :loading="!poolAnalytics">
                    <template #loading>
                        <b-skeleton-img no-aspect height="250px"></b-skeleton-img>
                    </template>
                    <line-chart :chartData="lineChartData" :chart-options="chartOptions" />
                </b-skeleton-wrapper>
            </b-card>
            <hr />
            <strong class="text-muted">Rewards</strong>
            <b-card class="mt-3">
                <b-skeleton-wrapper :loading="!poolAnalytics">
                    <template #loading>
                        <b-skeleton-img no-aspect height="250px"></b-skeleton-img>
                    </template>
                    <bar-chart :chartData="barChartData" :chart-options="chartOptions" />
                </b-skeleton-wrapper>
            </b-card>
            <hr />
        </b-col>
        <b-col md="4">
            <strong class="text-muted">Chart Settings</strong>
            <b-card class="mt-3">
                <b-form-group label="Last">
                    <b-input-group append="days">
                        <b-form-input min="1" max="1000" :value="daysRange" @change="onChangeDaysRange" type="number" />
                    </b-input-group>
                </b-form-group>
                <b-button block :disabled="isLoading" variant="primary" class="rounded-pill" @click="onClickUpdate">
                    <b-spinner v-if="isLoading" small />
                    <template v-else>Update</template>
                </b-button>
            </b-card>
        </b-col>
    </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPoolAnalytics } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';
import type { TPool } from '@thxnetwork/types/interfaces';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import LineChart from '@thxnetwork/dashboard/components/charts/LineChart.vue';

const ONE_DAY = 86400000; // one day in milliseconds

@Component({
    components: {
        BarChart,
        LineChart,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            analytics: 'pools/analytics',
        }),
    },
})
export default class ViewAnalyticsCharts extends Vue {
    isLoading = false;
    analytics!: IPoolAnalytics;
    chartOptions = {
        scales: {
            x: { grid: { display: false } },
            y: { display: true, grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
    };
    daysRange = 14;

    @Prop() pool!: TPool;

    get poolAnalytics() {
        return this.analytics[this.$route.params.id];
    }

    get chartDates() {
        // creates a list of dates for the charts
        const oneDay = 86400000; // one day in milliseconds
        let endDate = new Date();

        endDate.setHours(0, 0, 0, 0);
        let startDate = new Date(new Date(endDate).getTime() - oneDay * this.daysRange);

        const dates: string[] = [];
        for (let i = 0; i <= endDate.getTime() - startDate.getTime(); ) {
            const currentDate = new Date(new Date(startDate).getTime() + i);
            dates.push(format(currentDate, 'yyyy-MM-dd')); // format the date as the same format as the analytics data
            i += oneDay;
        }
        return dates;
    }

    get lineChartData() {
        let referralChartPoints: number[] = [];
        let conditionalChartPoints: number[] = [];
        let milestoneChartPoints: number[] = [];
        let dailyChartPoints: number[] = [];
        let web3ChartPoints: number[] = [];

        if (this.poolAnalytics) {
            // REFERRALS
            // assigns for each day of the chart, the related total amount, or 0 if there are no data for that day
            let points = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.referralRewards.find((x) => x.day == data);
                return dayData ? dayData.totalClaimPoints : 0;
            });

            // creates and exponential value array, summing each element of the array with the value of the previous element
            points.forEach((x, index) => {
                if (index === 0) {
                    referralChartPoints.push(x);
                    return;
                }
                referralChartPoints.push(x + referralChartPoints[index - 1]);
            });

            // Daily
            points = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.dailyRewards.find((x) => x.day == data);
                return dayData ? dayData.totalClaimPoints : 0;
            });

            points.forEach((x, index) => {
                if (index === 0) {
                    dailyChartPoints.push(x);
                    return;
                }
                dailyChartPoints.push(x + dailyChartPoints[index - 1]);
            });

            // CONDITIONALS
            points = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.pointRewards.find((x) => x.day == data);
                return dayData ? dayData.totalClaimPoints : 0;
            });

            points.forEach((x, index) => {
                if (index === 0) {
                    conditionalChartPoints.push(x);
                    return;
                }
                conditionalChartPoints.push(x + conditionalChartPoints[index - 1]);
            });

            // Milestones
            points = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.milestoneRewards.find((x) => x.day == data);
                return dayData ? dayData.totalClaimPoints : 0;
            });

            points.forEach((x, index) => {
                if (index === 0) {
                    milestoneChartPoints.push(x);
                    return;
                }
                milestoneChartPoints.push(x + milestoneChartPoints[index - 1]);
            });

            // Web3
            points = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.web3Quests.find((x) => x.day == data);
                return dayData ? dayData.totalClaimPoints : 0;
            });

            points.forEach((x, index) => {
                if (index === 0) {
                    web3ChartPoints.push(x);
                    return;
                }
                web3ChartPoints.push(x + web3ChartPoints[index - 1]);
            });
        }

        const result = {
            labels: this.chartDates.map((x) => format(new Date(x), 'MM-dd')),
            datasets: [
                {
                    label: 'Daily',
                    backgroundColor: '#5FE2F8',
                    data: dailyChartPoints,
                    borderColor: '#5FE2F8',
                    borderJoinStyle: 'round',
                    pointRadius: 3,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                    tension: 0.4,
                },
                {
                    label: 'Invite',
                    backgroundColor: 'rgb(152, 216, 13)',
                    data: referralChartPoints,
                    borderColor: 'rgb(152, 216, 13)',
                    borderJoinStyle: 'round',
                    pointRadius: 3,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                    tension: 0.4,
                },
                {
                    label: 'Social',
                    backgroundColor: '#FFBC38',
                    data: conditionalChartPoints,
                    borderColor: '#FFBC38',
                    borderJoinStyle: 'round',
                    pointRadius: 3,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                    tension: 0.4,
                },
                {
                    label: 'Custom',
                    backgroundColor: '#A52A2A',
                    data: milestoneChartPoints,
                    borderColor: '#A52A2A',
                    borderJoinStyle: 'round',
                    pointRadius: 3,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                    tension: 0.4,
                },
                {
                    label: 'Web3',
                    backgroundColor: '#0d6efd',
                    data: web3ChartPoints,
                    borderColor: '#0d6efd',
                    borderJoinStyle: 'round',
                    pointRadius: 3,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                    tension: 0.4,
                },
            ],
        };
        return result;
    }

    get barChartData() {
        let coinRewardPayments: number[] = [];
        let nftRewardPayments: number[] = [];
        let customRewardPayments: number[] = [];

        if (this.poolAnalytics) {
            coinRewardPayments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.erc20Perks.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });

            nftRewardPayments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.erc721Perks.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });

            customRewardPayments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.customRewards.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });
        }

        const result = {
            labels: this.chartDates.map((x) => format(new Date(x), 'MM-dd')),
            datasets: [
                {
                    label: 'Coin Rewards',
                    data: coinRewardPayments,
                    backgroundColor: '#0CC6F9',
                    borderColor: '#0CC6F9',
                    pointRadius: 0,
                },
                {
                    label: 'NFT Rewards',
                    data: nftRewardPayments,
                    backgroundColor: '#023B77',
                    borderColor: '#023B77',
                    pointRadius: 0,
                },
                {
                    label: 'Custom Rewards',
                    data: customRewardPayments,
                    backgroundColor: '#A52A2A',
                    borderColor: '#A52A2A',
                    pointRadius: 0,
                },
            ],
        };
        return result;
    }

    mounted() {
        this.readAnalytics();
    }

    async readAnalytics() {
        this.isLoading = true;

        const endDate = new Date();

        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(new Date(endDate).getTime() - ONE_DAY * this.daysRange);
        endDate.setHours(23, 59, 59, 0);

        await this.$store.dispatch('pools/readAnalytics', { poolId: this.pool._id, startDate, endDate });
        this.isLoading = false;
    }

    onChangeDaysRange(daysRange: number) {
        this.daysRange = daysRange;
    }

    onClickUpdate() {
        this.readAnalytics();
    }
}
</script>
