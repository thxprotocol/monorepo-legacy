<template>
    <b-card>
        <bar-chart :chart-data="barChartData" :chart-options="chartOptions" />
    </b-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPoolAnalytics } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';
import { RewardVariant } from '@thxnetwork/common/enums';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';

@Component({
    components: {
        BarChart,
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
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    boxWidth: 0,
                    boxHeight: 0,
                },
            },
        },
        responsive: true,
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
            },
            y: {
                stacked: true,
                display: false,
                grid: { display: false },
            },
        },
        maintainAspectRatio: false,
    };

    @Prop() pool!: TPool;
    @Prop() chartDates!: string[];

    get poolAnalytics() {
        return this.analytics[this.$route.params.id];
    }

    get barChartData() {
        const getData = (key: string) =>
            this.chartDates.map((data) => {
                if (!this.poolAnalytics[key]) return 0;
                const dayData = this.poolAnalytics[key].find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });

        const entries = {
            [RewardVariant.Coin]: getData('erc20Perks'),
            [RewardVariant.NFT]: getData('erc721Perks'),
            [RewardVariant.Custom]: getData('customRewards'),
            [RewardVariant.Coupon]: getData('couponRewards'),
            [RewardVariant.DiscordRole]: getData('discordRoleRewards'),
        };

        const style = {
            borderRadius: 3,
            hoverBackgroundColor: '#7d6ccb',
            backgroundColor: '#5942c1',
            borderWidth: 2,
        };
        const result = {
            labels: this.chartDates.map((x) => format(new Date(x), 'MM-dd')),
            datasets: [
                {
                    label: 'Coin',
                    data: entries[RewardVariant.Coin],
                    ...style,
                },
                {
                    label: 'NFT',
                    data: entries[RewardVariant.NFT],
                    ...style,
                },
                {
                    label: 'Custom',
                    data: entries[RewardVariant.Custom],
                    ...style,
                },
                {
                    label: 'Coupon',
                    data: entries[RewardVariant.Coupon],
                    ...style,
                },
                {
                    label: 'Discord Role',
                    data: entries[RewardVariant.DiscordRole],
                    ...style,
                },
            ],
        };
        return result;
    }
}
</script>
