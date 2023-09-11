<template>
    <b-card class="mt-3">
        <b-skeleton-wrapper :loading="!poolAnalytics">
            <template #loading>
                <b-skeleton-img no-aspect height="250px"></b-skeleton-img>
            </template>
            <bar-chart
                :chartData="barChartData"
                :chart-options="chartOptions"
                :height="250"
                style="position: relative; width: 100%"
            />
        </b-skeleton-wrapper>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import LineChart from '@thxnetwork/dashboard/components/charts/LineChart.vue';
import { IPoolAnalytics } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';
import { TPool } from '@thxnetwork/types/interfaces';

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
export default class ViewAnalyticsRewards extends Vue {
    loading = false;
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

        const dates = [];
        for (let i = 0; i <= endDate.getTime() - startDate.getTime(); ) {
            const currentDate = new Date(new Date(startDate).getTime() + i);
            dates.push(format(currentDate, 'yyyy-MM-dd')); // format the date as the same format as the analytics data
            i += oneDay;
        }
        return dates;
    }

    get barChartData() {
        let coinRewardPayments: number[] = [];
        let nftRewardPayments: number[] = [];
        let customRewardPayments: number[] = [];

        if (this.poolAnalytics) {
            coinRewardPayments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.erc721Perks.find((x) => x.day == data);
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

    async mounted() {
        this.loading = true;

        const oneDay = 86400000; // one day in milliseconds
        const endDate = new Date();

        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(new Date(endDate).getTime() - oneDay * this.daysRange);
        endDate.setHours(23, 59, 59, 0);

        this.$store.dispatch('pools/readAnalytics', { poolId: this.pool._id, startDate, endDate });
        this.loading = false;
    }
}
</script>
