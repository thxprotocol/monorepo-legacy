<template>
    <div>
        <h2 class="mb-0">Dashboard</h2>
        <div class="py-5" v-if="loading">
            <b-spinner variant="primary" />
        </div>
        <bar-chart v-else :chartData="chartData" :chart-options="chartOptions" />
        <b-row v-if="pool.metrics" class="mt-5">
            <b-col md="3">
                <b-card bg-variant="white shadow-sm">
                    <span>Claims</span><br />
                    <div class="h2">{{ pool.metrics.claims }}</div>
                </b-card>
            </b-col>
            <b-col md="3">
                <b-card bg-variant="white shadow-sm">
                    <span>Referrals</span><br />
                    <div class="h2">{{ pool.metrics.referrals }}</div>
                </b-card>
            </b-col>
            <b-col md="3" v-if="pool.erc721">
                <b-card bg-variant="white shadow-sm">
                    <span>Minted (ERC721)</span><br />
                    <div class="h2">{{ pool.metrics.mints }}</div>
                </b-card>
            </b-col>
            <b-col md="3" v-if="pool.erc20">
                <b-card bg-variant="white shadow-sm">
                    <span>Withdrawals (ERC20)</span><br />
                    <div class="h2">{{ pool.metrics.withdrawals }}</div>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { ITransactions } from '@thxnetwork/dashboard/types/ITransactions';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import { GetTransactionsResponse } from '@thxnetwork/dashboard/store/modules/transactions';

@Component({
    components: { BaseNothingHere, BarChart },
    computed: mapGetters({
        pools: 'pools/all',
        transactions: 'transactions/all',
    }),
})
export default class TransactionsView extends Vue {
    pools!: IPools;
    transactions!: ITransactions;
    loading = false;

    chartData: any = {
        labels: [],
        datasets: [
            {
                label: 'Transaction volume',
                backgroundColor: '#5942c1',
                data: [],
            },
        ],
    };

    chartOptions = {
        scales: {
            x: { grid: { display: false } },
            y: { display: false, grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    get pool() {
        return this.pools[this.$route.params.id];
    }

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    async mounted() {
        this.loading = true;

        // CREATE THE DATE RANGES FOR THE QUERY
        let lastDate = new Date();
        lastDate.setHours(0, 0, 0, 0);

        let startDate = new Date(lastDate);
        startDate.setDate(startDate.getDate() - 14); // subtract 30 days

        const labels = [];
        const promises = [];

        while (startDate.getTime() <= lastDate.getTime()) {
            labels.push(this.formatDateLabel(startDate));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const promise = new Promise((resolve, reject) => {
                try {
                    const response: Promise<GetTransactionsResponse | undefined> = this.$store.dispatch(
                        'transactions/list',
                        {
                            pool: this.pool,
                            startDate: startDate.getTime(),
                            endDate: endDate.getTime(),
                        },
                    );
                    const result = response.then((x) => {
                        return x ? x.total : 0;
                    });
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
            promises.push(promise);

            startDate.setDate(startDate.getDate() + 1);
        }
        this.chartData.labels = labels;

        Promise.all(promises).then((data) => {
            this.chartData.datasets[0].data = data;
            this.loading = false;
        });
    }
}
</script>
