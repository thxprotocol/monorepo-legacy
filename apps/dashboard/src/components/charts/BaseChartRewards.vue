<template>
    <b-card>
        <bar-chart :chartData="barChartData" :chart-options="chartOptions" />
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
    chartOptions = {
        scales: {
            x: { display: false, grid: { display: false } },
            y: { display: false, grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    @Prop() pool!: TPool;
    @Prop() chartDates!: string[];

    get poolAnalytics() {
        return this.analytics[this.$route.params.id];
    }

    get barChartData() {
        let coinRewardPayments: number[] = [];
        let nftRewardPayments: number[] = [];
        let customRewardPayments: number[] = [];
        let couponRewardPayments: number[] = [];
        let discordRoleRewardPayments: number[] = [];

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

            couponRewardPayments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.couponRewards.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });

            discordRoleRewardPayments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.discordRoleRewards.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });
        }

        const result = {
            labels: this.chartDates.map((x) => format(new Date(x), 'MM-dd')),
            datasets: [
                {
                    label: 'Coin',
                    data: coinRewardPayments,
                    backgroundColor: '#4fa3d1',
                    borderColor: '#4fa3d1',
                    pointRadius: 0,
                },
                {
                    label: 'NFT',
                    data: nftRewardPayments,
                    backgroundColor: '#5eb36a',
                    borderColor: '#5eb36a',
                    pointRadius: 0,
                },
                {
                    label: 'Custom',
                    data: customRewardPayments,
                    backgroundColor: '#e88f51',
                    borderColor: '#e88f51',
                    pointRadius: 0,
                },
                {
                    label: 'Coupon',
                    data: couponRewardPayments,
                    backgroundColor: '#f3d053',
                    borderColor: '#f3d053',
                    pointRadius: 0,
                },
                {
                    label: 'Discord Role',
                    data: discordRoleRewardPayments,
                    backgroundColor: '#a3a3a3',
                    borderColor: '#a3a3a3',
                    pointRadius: 0,
                },
            ],
        };
        return result;
    }
}
</script>
