<template>
    <div>
        <h2>Dashboard</h2>
        <div class="py-5" v-if="loading">
            <b-spinner variant="primary" />
        </div>
        <bar-chart v-else :chartData="chartData" :chart-options="chartOptions" />
        <b-row v-if="pool.metrics" class="mt-5">
            <b-col md="3">
                <b-card bg-variant="primary" class="shadow-sm text-white">
                    <span>Claims</span><br />
                    <div class="h2">{{ pool.metrics.claims }}</div>
                </b-card>
            </b-col>
            <b-col md="3">
                <b-card bg-variant="primary" class="shadow-sm text-white">
                    <span>Referrals</span><br />
                    <div class="h2">{{ pool.metrics.referrals }}</div>
                </b-card>
            </b-col>
            <b-col md="6">
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
        <BaseModalErc20Create :chainId="pool.chainId" />
        <BaseModalErc20Import :chainId="pool.chainId" />
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { ITransactions } from '@thxnetwork/dashboard/types/ITransactions';
import { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import BarChart from '@thxnetwork/dashboard/components/charts/BarChart.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseModalErc20Import from '@thxnetwork/dashboard/components/modals/BaseModalERC20Import.vue';
import BaseModalErc20Create from '@thxnetwork/dashboard/components/modals/BaseModalERC20Create.vue';
import BaseModalDepositCreate from '@thxnetwork/dashboard/components/modals/BaseModalDepositCreate.vue';
import { fromWei } from 'web3-utils';

@Component({
    components: { BaseIdenticon, BaseModalDepositCreate, BaseModalErc20Create, BaseModalErc20Import, BarChart },
    computed: mapGetters({
        pools: 'pools/all',
        erc20s: 'erc20/all',
    }),
})
export default class TransactionsView extends Vue {
    fromWei = fromWei;
    pools!: IPools;
    erc20s!: IERC20s;
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

    async onTopup(erc20: TERC20) {
        await this.$store.dispatch('erc20/read', erc20._id);
        this.$store.dispatch('erc20/getBalance', { id: erc20._id, address: this.pool.address });
    }

    async mounted() {
        this.loading = true;

        // CREATE THE DATE RANGES FOR THE QUERY
        let lastDate = new Date();
        lastDate.setHours(0, 0, 0, 0);

        let startDate = new Date(lastDate);
        startDate.setDate(startDate.getDate() - 14); // subtract 30 days

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
