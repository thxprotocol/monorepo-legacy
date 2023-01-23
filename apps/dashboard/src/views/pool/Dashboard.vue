<template>
    <div>
        <h2>Dashboard</h2>
        <div class="py-5" v-if="loading">
            <b-spinner variant="primary" />
        </div>
        <b-row class="mt-5" v-if="analytics">
            <b-col md="6">
                <b-row class="mt-5">
                    <line-chart :chartData="referralChartData" :chart-options="chartOptions" />
                </b-row>
                <b-row>
                    <b-col md="4">
                        <b-card bg-variant="primary" class="shadow-sm text-white">
                            <span>Referrals</span><br />
                            <div class="h2">{{ totals.referralRewards }}</div>
                        </b-card>
                    </b-col>
                    <b-col md="4">
                        <b-card bg-variant="primary" class="shadow-sm text-white">
                            <span>Conditions</span><br />
                            <div class="h2">{{ totals.pointRewards }}</div>
                        </b-card>
                    </b-col>
                    <b-col md="4">
                        <b-card bg-variant="primary" class="shadow-sm text-white">
                            <span>Milestones</span><br />
                            <div class="h2">0</div>
                        </b-card>
                    </b-col>
                </b-row>
                <b-row class="mt-5">
                    <b-col>
                        <div class="card-header block">Leaderboard</div>
                        <div>
                            <b-list-group>
                                <b-list-group-item
                                    :key="erc20._id"
                                    v-for="erc20 of erc20s"
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
                                <b-list-group-item v-if="!Object.values(erc20s).length">
                                    <span class="text-muted">No coins found for your account.</span>
                                </b-list-group-item>
                            </b-list-group>
                        </div>
                    </b-col>
                </b-row>
            </b-col>
            <b-col md="6">
                <b-row class="mt-5">
                    <b-col>
                        <bar-chart :chartData="perkChartData" :chart-options="chartOptions" />
                    </b-col>
                </b-row>
                <b-row>
                    <b-col md="4">
                        <b-card bg-variant="primary" class="shadow-sm text-white">
                            <span>Coin Perks</span><br />
                            <div class="h2">{{ totals.erc20Perks }}</div>
                        </b-card>
                    </b-col>
                    <b-col md="4">
                        <b-card bg-variant="primary" class="shadow-sm text-white">
                            <span>NFT Perks</span><br />
                            <div class="h2">{{ totals.erc721Perks }}</div>
                        </b-card>
                    </b-col>
                </b-row>
                <b-row class="mt-5">
                    <b-col>
                        <div class="card-header block">Balance</div>
                        <div>
                            <b-list-group>
                                <b-list-group-item
                                    :key="erc20._id"
                                    v-for="erc20 of erc20s"
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
                                <b-list-group-item v-if="!Object.values(erc20s).length">
                                    <span class="text-muted">No coins found for your account.</span>
                                </b-list-group-item>
                            </b-list-group>
                        </div>
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
import { IPoolAnalytics, IPools } from '../../store/modules/pools';

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
    daysRange = 14;

    perkChartData: any = {
        labels: [],
        datasets: [
            {
                label: 'Perks',
                backgroundColor: '#5942c1',
                data: [],
            },
        ],
    };

    chartOptions = {
        scales: {
            x: { grid: { display: false } },
            y: { display: true, grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get totals() {
        const analytics = this.analytics[this.$route.params.id];
        return {
            erc20Perks: !analytics
                ? 0
                : analytics.erc20Perks
                      .map((x) => x.totalAmount)
                      .reduce((a, b) => {
                          return a + b;
                      }, 0),
            erc721Perks: !analytics
                ? 0
                : analytics.erc721Perks
                      .map((x) => x.totalAmount)
                      .reduce((a, b) => {
                          return a + b;
                      }, 0),
            referralRewards: !analytics
                ? 0
                : analytics.referralRewards
                      .map((x) => x.totalClaimPoints)
                      .reduce((a, b) => {
                          return a + b;
                      }, 0),
            pointRewards: !analytics
                ? 0
                : analytics.pointRewards
                      .map((x) => x.totalClaimPoints)
                      .reduce((a, b) => {
                          return a + b;
                      }, 0),
        };
    }

    get dates() {
        // creates a list of dates for the Y axes of the charts
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

    get referralChartData() {
        let chartPoints: number[] = [];
        const analytics = this.analytics[this.$route.params.id];

        if (analytics) {
            // assigns for each day of the chart, the related total amount, or 0 if there are no data for that day
            const points = this.dates.map((data) => {
                const dayData = analytics.referralRewards.find((x) => x.day == data);
                return dayData ? dayData.totalClaimPoints : 0;
            });

            // creates and exponential value array, summing each element of the array with the value of the previous element
            points.forEach((x, index) => {
                if (index === 0) {
                    chartPoints.push(x);
                    return;
                }
                chartPoints.push(x + chartPoints[index - 1]);
            });
        }

        const result = {
            labels: this.dates,
            datasets: [
                {
                    label: 'Referrals',
                    backgroundColor: '#5942c1',
                    data: chartPoints,
                },
            ],
        };
        return result;
    }

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

        await this.$store
            .dispatch('pools/readAnalytics', { poolId: this.pool._id, startDate, endDate })
            .then(async (data) => {
                this.analytics = data;
            });

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
