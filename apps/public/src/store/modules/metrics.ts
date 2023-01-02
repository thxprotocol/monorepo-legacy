import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { CMS_URL } from '../../config/secrets';

export class Metric {
    id: string;
    avgRewardsPerPool: number;
    avgWithdrawalsPerPool: number;
    countApplications: number;
    countAssetPools: {
        mainnet: number;
        testnet: number;
    };
    countTransactions: {
        mainnet: number;
        testnet: number;
    };
    countWallets: number;
    createdAt: Date;
    minutesAgo: number;

    constructor(data: any) {
        this.id = data.id;
        this.avgRewardsPerPool = data.avg_rewards_per_pool;
        this.avgWithdrawalsPerPool = data.avg_withdrawals_per_pool;
        this.countApplications = data.count_applications;
        this.countAssetPools = data.count_asset_pools;
        this.countTransactions = data.count_transactions;
        this.countWallets = data.count_wallets;
        this.createdAt = new Date(data.createdAt);
        this.minutesAgo = Math.ceil((new Date().getTime() - new Date(data.createdAt).getTime()) / 1000 / 60);
    }
}

export interface IMetrics {
    [id: string]: Metric;
}

@Module({ namespaced: true })
class MetricsModule extends VuexModule {
    _all: IMetrics = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(metric: Metric) {
        Vue.set(this._all, metric.id, metric);
    }

    @Mutation
    unset(rat: string) {
        Vue.delete(this._all, rat);
    }

    @Action
    async read(limit: number) {
        try {
            const r = await axios({
                method: 'GET',
                url: CMS_URL + '/metrics?_sort=createdAt:DESC&_limit=' + limit,
            });

            if (!r.data) {
                throw new Error('No data found.');
            }

            r.data.map((d: any) => {
                this.context.commit('set', new Metric(d));
            });
        } catch (e) {
            console.error(e);
        }
    }
}

export default MetricsModule;
