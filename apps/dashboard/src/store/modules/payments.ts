import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPayments } from '@thxnetwork/dashboard/types/IPayments';
import { IPool } from './pools';
import { PaymentState } from '@thxnetwork/dashboard/types/enums/PaymentState';

export type TPayment = {
    _id: string;
    id: string;
    amount: string;
    tokenAddress: string;
    poolId: string;
    chainId: number;
    sender: string;
    receiver: string;
    transactions: string[];
    state: PaymentState;
    paymentUrl: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    createdAt: Date;
    updatedAt: Date;
};

@Module({ namespaced: true })
class PaymentModule extends VuexModule {
    _all: IPayments = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ pool, payment }: { pool: IPool; payment: TPayment }) {
        if (!this._all[pool._id]) {
            Vue.set(this._all, pool._id, {});
        }
        Vue.set(this._all[pool._id], payment.id, payment);
    }

    @Action({ rawError: true })
    async list(pool: IPool) {
        const r = await axios({
            method: 'GET',
            url: '/payments',
            headers: { 'X-PoolId': pool._id },
        });

        for (const payment of r.data) {
            this.context.commit('set', { pool, payment });
        }
    }

    @Action({ rawError: true })
    async read({ pool, id }: { pool: IPool; id: string }) {
        const r = await axios({
            method: 'GET',
            url: '/payments/' + id,
            headers: { 'X-PoolId': pool._id },
        });

        this.context.commit('set', { pool, payments: r.data });
    }

    @Action({ rawError: true })
    async create({ pool, payment }: { pool: IPool; payment: TPayment }) {
        const { data } = await axios({
            method: 'POST',
            url: '/payments',
            headers: { 'X-PoolId': pool._id },
            data: payment,
        });

        this.context.commit('set', { payment: data, pool });
    }
}

export default PaymentModule;
