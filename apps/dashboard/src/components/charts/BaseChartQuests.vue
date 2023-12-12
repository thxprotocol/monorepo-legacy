<template>
    <b-card>
        <line-chart :chartData="lineChartData" :chart-options="chartOptions" />
    </b-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPoolAnalytics } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';
import type { TPool } from '@thxnetwork/types/interfaces';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import LineChart from '@thxnetwork/dashboard/components/charts/LineChart.vue';
import { ChartOptions } from 'chart.js';

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
export default class BaseChardQuests extends Vue {
    isLoading = false;
    analytics!: IPoolAnalytics;
    chartOptions: ChartOptions = {
        scales: {
            x: { display: false, grid: { display: false } },
            y: { display: false, grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
    };
    daysRange = 14;

    @Prop() pool!: TPool;
    @Prop() startDate!: Date;
    @Prop() endDate!: Date;

    get poolAnalytics() {
        return this.analytics[this.$route.params.id];
    }

    get chartDates() {
        // creates a list of dates for the charts
        const oneDay = 86400000; // one day in milliseconds

        const dates: string[] = [];
        for (let i = 0; i <= this.endDate.getTime() - this.startDate.getTime(); ) {
            const currentDate = new Date(this.startDate.getTime() + i);
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

        const style = {
            borderJoinStyle: 'round',
            pointRadius: 3,
            pointHoverRadius: 8,
            hoverBorderJoinStyle: 'round',
            tension: 0.4,
        };
        const result = {
            labels: this.chartDates.map((x) => format(new Date(x), 'MM-dd')),
            datasets: [
                {
                    label: 'Daily',
                    backgroundColor: '#4fa3d1',
                    data: dailyChartPoints,
                    borderColor: '#4fa3d1',
                    ...style,
                },
                {
                    label: 'Invite',
                    backgroundColor: '#5eb36a',
                    data: referralChartPoints,
                    borderColor: '#5eb36a',
                    ...style,
                },
                {
                    label: 'Social',
                    backgroundColor: '#e88f51',
                    data: conditionalChartPoints,
                    borderColor: '#e88f51',
                    ...style,
                },
                {
                    label: 'Custom',
                    backgroundColor: '#f3d053',
                    data: milestoneChartPoints,
                    borderColor: '#f3d053',
                    ...style,
                },
                {
                    label: 'Web3',
                    backgroundColor: '#a3a3a3',
                    data: web3ChartPoints,
                    borderColor: '#a3a3a3',
                    ...style,
                },
            ],
        };
        return result;
    }
}
</script>
