<template>
    <div>
        <h2>Dashboard</h2>
        <b-row>
            <b-col md="8">
                <b-row class="mt-5">
                    <b-col>
                        <b-skeleton-wrapper :loading="!poolAnalytics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="250px"></b-skeleton-img>
                            </template>
                            <line-chart
                                :chartData="lineChartData"
                                :chart-options="chartOptions"
                                :height="250"
                                style="position: relative; width: 100%"
                            />
                        </b-skeleton-wrapper>
                    </b-col>
                </b-row>
                <b-row class="mt-5">
                    <b-col md="3">
                        <b-skeleton-wrapper :loading="!metrics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="110px"></b-skeleton-img>
                            </template>
                            <b-card v-if="metrics" bg-variant="dark" class="shadow-sm text-white">
                                <span>Daily</span><br />
                                <div class="h2">{{ metrics.dailyRewards.totalClaimPoints }}</div>
                            </b-card>
                        </b-skeleton-wrapper>
                    </b-col>
                    <b-col md="3">
                        <b-skeleton-wrapper :loading="!metrics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="110px"></b-skeleton-img>
                            </template>
                            <b-card v-if="metrics" bg-variant="dark" class="shadow-sm text-white">
                                <span>Referrals</span><br />
                                <div class="h2">{{ metrics.referralRewards.totalClaimPoints }}</div>
                            </b-card>
                        </b-skeleton-wrapper>
                    </b-col>
                    <b-col md="3">
                        <b-skeleton-wrapper :loading="!metrics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="110px"></b-skeleton-img>
                            </template>
                            <b-card v-if="metrics" bg-variant="dark" class="shadow-sm text-white">
                                <span>Conditionals</span><br />
                                <div class="h2">{{ metrics.pointRewards.totalClaimPoints }}</div>
                            </b-card>
                        </b-skeleton-wrapper>
                    </b-col>
                    <b-col md="3">
                        <b-skeleton-wrapper :loading="!metrics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="110px"></b-skeleton-img>
                            </template>
                            <b-card v-if="metrics" bg-variant="dark" class="shadow-sm text-white">
                                <span>Milestones</span><br />
                                <div class="h2">{{ metrics.milestoneRewards.totalClaimPoints }}</div>
                            </b-card>
                        </b-skeleton-wrapper>
                    </b-col>
                </b-row>

                <b-row class="mt-5">
                    <b-col>
                        <div class="card-header block">Leaderboard</div>
                        <b-skeleton-wrapper :loading="!leaderBoard">
                            <template #loading>
                                <b-skeleton-table
                                    :rows="2"
                                    :columns="1"
                                    :table-props="{ bordered: false, striped: false }"
                                ></b-skeleton-table>
                            </template>
                            <b-list-group v-if="leaderBoard">
                                <b-list-group-item
                                    v-for="(result, key) of leaderBoard"
                                    :key="key"
                                    class="d-flex justify-content-between align-items-center"
                                >
                                    <div class="d-flex center-center">
                                        <img
                                            :height="30"
                                            :width="30"
                                            :src="result.account.profileImg"
                                            alt=""
                                            class="mr-2"
                                        />
                                        <div style="line-height: 1.2">
                                            <strong>
                                                {{ result.account.firstName }} {{ result.account.lastName }}
                                            </strong>
                                            <span>{{ result.account.email }}</span>
                                            <br />
                                            <small class="text-muted">{{ result.account.address }}</small>
                                        </div>
                                    </div>
                                    <div>
                                        <i class="fas fa-trophy m-1" style="font-size: 1.1rem; color: silver"></i>
                                        <strong class="text-primary"> {{ result.score }} </strong>
                                    </div>
                                </b-list-group-item>
                            </b-list-group>
                        </b-skeleton-wrapper>
                    </b-col>
                </b-row>
            </b-col>
            <b-col md="4">
                <b-row class="mt-5">
                    <b-col>
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
                    </b-col>
                </b-row>
                <b-row class="mt-5">
                    <b-col md="6">
                        <b-skeleton-wrapper :loading="!metrics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="110px"></b-skeleton-img>
                            </template>
                            <b-card v-if="metrics" bg-variant="dark" class="shadow-sm text-white">
                                <span>Coin Perks</span><br />
                                <div class="h2">{{ metrics.erc20Perks.payments }}</div>
                            </b-card>
                        </b-skeleton-wrapper>
                    </b-col>
                    <b-col md="6">
                        <b-skeleton-wrapper :loading="!metrics">
                            <template #loading>
                                <b-skeleton-img no-aspect height="110px"></b-skeleton-img>
                            </template>
                            <b-card v-if="metrics" bg-variant="dark" class="shadow-sm text-white">
                                <span>NFT Perks</span><br />
                                <div class="h2">{{ metrics.erc721Perks.payments }}</div>
                            </b-card>
                        </b-skeleton-wrapper>
                    </b-col>
                </b-row>
                <b-row class="mt-5" v-if="!erc20s">
                    <b-col>
                        <div class="py-5 w-100 center-center">
                            <b-spinner variant="primary" />
                        </div>
                    </b-col>
                </b-row>
                <b-row class="mt-5" v-else>
                    <b-col>
                        <b-list-group>
                            <b-list-group-item
                                :key="erc20._id"
                                v-for="erc20 of Object.values(erc20s).filter((e) => e.chainId === pool.chainId)"
                                class="d-flex justify-content-between align-items-center"
                            >
                                <div class="d-flex center-center">
                                    <base-identicon
                                        class="mr-2"
                                        size="40"
                                        :rounded="true"
                                        variant="darker"
                                        :uri="erc20.logoImgUrl"
                                    />
                                    <div style="line-height: 1.2">
                                        <strong>{{ erc20.name }}</strong>
                                        <div class="text-muted" v-if="erc20.poolBalance">
                                            {{ fromWei(String(erc20.poolBalance), 'ether') }} {{ erc20.symbol }}
                                        </div>
                                    </div>
                                </div>
                                <b-button v-b-modal="`modalDepositCreate-${erc20._id}`" variant="light">
                                    <i class="fas fa-download m-0" style="font-size: 1.1rem"></i>
                                </b-button>
                                <BaseModalDepositCreate @submit="onTopup(erc20)" :erc20="erc20" :pool="pool" />
                            </b-list-group-item>
                            <b-list-group-item
                                v-if="!Object.values(erc20s).filter((e) => e.chainId === pool.chainId).length"
                            >
                                <span class="text-muted">No coins found for your account.</span>
                            </b-list-group-item>
                            <b-list-group-item>
                                <b-button v-b-modal="'modalERC20Import'" block variant="primary" class="rounded-pill">
                                    Import coin
                                    <i class="fas fa-chevron-right"></i>
                                </b-button>
                                <b-button v-b-modal="'modalERC20Create'" block variant="link" class="rounded-pill">
                                    Create coin
                                    <i class="fas fa-chevron-right"></i>
                                </b-button>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>

        <BaseModalErc20Create :chainId="pool.chainId" />
        <BaseModalErc20Import :chainId="pool.chainId" />
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { ITransactions } from '@thxnetwork/dashboard/types/ITransactions';
import { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import LineChart from '@thxnetwork/dashboard/components/charts/LineChart.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseModalErc20Import from '@thxnetwork/dashboard/components/modals/BaseModalERC20Import.vue';
import BaseModalErc20Create from '@thxnetwork/dashboard/components/modals/BaseModalERC20Create.vue';
import BaseModalDepositCreate from '@thxnetwork/dashboard/components/modals/BaseModalDepositCreate.vue';
import { fromWei } from 'web3-utils';
import { format } from 'date-fns';
import { IPoolAnalytics, IPoolAnalyticsLeaderBoard, IPoolAnalyticsMetrics, IPools } from '../../store/modules/pools';

@Component({
    components: {
        BaseIdenticon,
        BaseModalDepositCreate,
        BaseModalErc20Create,
        BaseModalErc20Import,
        BarChart,
        LineChart,
    },
    computed: mapGetters({
        pools: 'pools/all',
        analytics: 'pools/analytics',
        analyticsLeaderboard: 'pools/analyticsLeaderBoard',
        analyticsMetrics: 'pools/analyticsMetrics',
        erc20s: 'erc20/all',
    }),
})
export default class TransactionsView extends Vue {
    fromWei = fromWei;
    pools!: IPools;
    erc20s!: IERC20s;
    transactions!: ITransactions;
    loading = false;
    format = format;
    analytics!: IPoolAnalytics;
    analyticsLeaderboard!: IPoolAnalyticsLeaderBoard;
    analyticsMetrics!: IPoolAnalyticsMetrics;
    daysRange = 14;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get poolAnalytics() {
        return this.analytics[this.$route.params.id];
    }

    get leaderBoard() {
        if (!this.analyticsLeaderboard[this.$route.params.id]) return null;
        return this.analyticsLeaderboard[this.$route.params.id];
    }

    get metrics() {
        if (!this.analyticsMetrics[this.$route.params.id]) return null;
        return this.analyticsMetrics[this.$route.params.id];
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

    get lineChartData() {
        let referralChartPoints: number[] = [];
        let conditionalChartPoints: number[] = [];
        let milestoneChartPoints: number[] = [];
        let dailyChartPoints: number[] = [];

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
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                },
                {
                    label: 'Referral',
                    backgroundColor: 'rgb(152, 216, 13)',
                    data: referralChartPoints,
                    borderColor: 'rgb(152, 216, 13)',
                    borderJoinStyle: 'round',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                },
                {
                    label: 'Conditional',
                    backgroundColor: '#FFBC38',
                    data: conditionalChartPoints,
                    borderColor: '#FFBC38',
                    borderJoinStyle: 'round',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                },
                {
                    label: 'Milestone',
                    backgroundColor: '#0d6efd',
                    data: milestoneChartPoints,
                    borderColor: '#0d6efd',
                    borderJoinStyle: 'round',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    hoverBorderJoinStyle: 'round',
                },
            ],
        };
        return result;
    }

    get barChartData() {
        let erc20Payments: number[] = [];
        let erc721Payments: number[] = [];
        if (this.poolAnalytics) {
            // COIN PERKS
            // assigns for each day of the chart, the related total amount, or 0 if there are no data for that day
            erc20Payments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.erc20Perks.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });

            // NFT PERKS
            erc721Payments = this.chartDates.map((data) => {
                const dayData = this.poolAnalytics.erc721Perks.find((x) => x.day == data);
                return dayData ? dayData.totalAmount : 0;
            });
        }

        const result = {
            labels: this.chartDates.map((x) => format(new Date(x), 'MM-dd')),
            datasets: [
                {
                    label: 'Coin Perks',
                    data: erc20Payments,
                    backgroundColor: '#0CC6F9',
                    borderColor: '#0CC6F9',
                    pointRadius: 0,
                },
                {
                    label: 'NFT Perks',
                    data: erc721Payments,
                    backgroundColor: '#023B77',
                    borderColor: '#023B77',
                    pointRadius: 0,
                },
            ],
        };
        return result;
    }

    chartOptions = {
        scales: {
            x: { grid: { display: false } },
            y: { display: true, grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    async onTopup(erc20: TERC20) {
        await this.$store.dispatch('erc20/read', erc20._id);
        this.$store.dispatch('erc20/getBalance', { id: erc20._id, address: this.pool.address });
    }

    async mounted() {
        this.loading = true;

        // CREATE THE DATE RANGES FOR THE QUERY
        const oneDay = 86400000; // one day in milliseconds
        const endDate = new Date();

        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(new Date(endDate).getTime() - oneDay * this.daysRange);
        endDate.setHours(23, 59, 59, 0);

        await this.$store.dispatch('pools/read', this.$route.params.id);
        await this.$store.dispatch('pools/readAnalyticsMetrics', { poolId: this.pool._id });
        await this.$store.dispatch('pools/readAnalytics', { poolId: this.pool._id, startDate, endDate });
        await this.$store.dispatch('pools/readAnalyticsLeaderBoard', { poolId: this.pool._id });

        this.$store.dispatch('erc20/list').then(async () => {
            await Promise.all(
                Object.values(this.erc20s).map(async (erc20) => {
                    await this.$store.dispatch('erc20/read', erc20._id);
                    await this.$store.dispatch('erc20/getBalance', { id: erc20._id, address: this.pool.address });
                }),
            );
        });
        this.loading = false;
    }
}
</script>
