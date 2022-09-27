import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from '@thxprotocol/dashboard/store/modules/pools';
import { ChainId } from '@thxprotocol/dashboard/types/enums/ChainId';
import { ITransactions } from '@thxprotocol/dashboard/types/ITransactions';

export enum TransactionType {
    Default = 0,
    ITX = 1,
}

export enum TransactionState {
    Scheduled = 0,
    Mined = 1,
    Failed = 2,
    Sent = 3,
}

export type TTransaction = {
    type: TransactionType;
    state: TransactionState;
    from: string;
    to: string;
    nonce: number;
    gas: string;
    network: ChainId;
    transactionHash: string;
    relayTransactionHash?: string;
    call?: { fn: string; args: string };
    baseFee?: string;
    maxFeeForGas?: string;
    maxPriorityFeeForGas?: string;
};

export interface GetTransactionsProps {
    pool: IPool;
    page?: number;
    limit?: number;
    startDate?: number;
    endDate?: number;
}

const TRANSACTIONS_RESPONSE: GetTransactionsResponse = {
    results: [],
    total: 0,
};

export interface GetTransactionsResponse {
    results: TTransaction[];
    next?: { page: number };
    previous?: { page: number };
    limit?: number;
    total: number;
}

@Module({ namespaced: true })
class TransactionModule extends VuexModule {
    _all: ITransactions = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ pool, transaction }: { pool: IPool; transaction: TTransaction }) {
        if (!this._all[pool._id]) {
            Vue.set(this._all, pool._id, {});
        }
        Vue.set(this._all[pool._id], transaction.transactionHash, transaction);
    }

    @Action({ rawError: true })
    async list({
        pool,
        page,
        limit,
        startDate,
        endDate,
    }: GetTransactionsProps): Promise<GetTransactionsResponse | undefined> {
        try {
            const params = new URLSearchParams();
            if (page) {
                params.set('page', String(page));
            }
            if (limit) {
                params.set('limit', String(limit));
            }
            if (startDate) {
                params.set('startDate', String(startDate));
            }
            if (endDate) {
                params.set('endDate', String(endDate));
            }

            const r = await axios({
                method: 'GET',
                url: '/transactions?' + params.toString(),
                headers: { 'X-PoolId': pool._id },
            });

            return r.data.results.length ? r.data : TRANSACTIONS_RESPONSE;
        } catch (e) {
            console.log(e);
        }

        return undefined;
    }
}
export default TransactionModule;
