import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { ITransactions, TTransaction } from '@thxnetwork/wallet/types/Transactions';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

@Module({ namespaced: true })
class WithdrawalModule extends VuexModule {
    _all: ITransactions = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(tx: TTransaction) {
        Vue.set(this._all, tx._id, tx);
    }

    @Mutation
    unset(tx: TTransaction) {
        Vue.delete(this._all, tx._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async read(id: string) {
        const data = await thxClient.transactions.read(id);
        this.context.commit('set', data);
        return data;
    }
}

export default WithdrawalModule;
