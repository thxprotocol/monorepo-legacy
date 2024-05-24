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
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import { ChartOptions } from 'chart.js';
import { QuestVariant } from '@thxnetwork/common/enums';

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
    chartOptions: ChartOptions = {
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
    daysRange = 14;

    @Prop() pool!: TPool;
    @Prop() chartDates!: string[];

    get poolAnalytics() {
        return this.analytics[this.$route.params.id];
    }

    get barChartData() {
        if (!this.poolAnalytics) return;

        const getData = (key: string) =>
            this.chartDates.map((data) => {
                if (!this.poolAnalytics[key]) return 0;
                const dayData = this.poolAnalytics[key].find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });

        const entries = {
            [QuestVariant.Invite]: getData('referralRewards'),
            [QuestVariant.Twitter]: getData('pointRewards'),
            [QuestVariant.Daily]: getData('dailyRewards'),
            [QuestVariant.Custom]: getData('milestoneRewards'),
            [QuestVariant.Web3]: getData('web3Quests'),
            [QuestVariant.Gitcoin]: getData('gitcoinQuests'),
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
                    label: 'Daily',
                    data: entries[QuestVariant.Daily],
                    ...style,
                },
                {
                    label: 'Invite',
                    data: entries[QuestVariant.Invite],
                    ...style,
                },
                {
                    label: 'Social',
                    data: entries[QuestVariant.Twitter],
                    ...style,
                },
                {
                    label: 'Custom',
                    data: entries[QuestVariant.Custom],
                    ...style,
                },
                {
                    label: 'Web3',
                    data: entries[QuestVariant.Web3],
                    ...style,
                },
                {
                    label: 'Gitcoin',
                    data: entries[QuestVariant.Gitcoin],
                    ...style,
                },
            ],
        };
        return result;
    }
}
</script>
