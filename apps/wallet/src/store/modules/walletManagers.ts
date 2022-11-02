import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IWalletManagers, TWalletManager } from '@thxnetwork/wallet/types/WalletManagers';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { TWallet } from '@thxnetwork/wallet/types/Wallet';

@Module({ namespaced: true })
class WalletManagerModule extends VuexModule {
    _all: IWalletManagers = {};
    _wallet: TWallet | null = null;

    get all() {
        return this._all;
    }

    get wallet() {
        return this._wallet;
    }

    @Mutation
    setWallet(wallet: TWallet) {
        this._wallet = wallet;
    }

    @Mutation
    set({ walletManager, walletId }: { walletManager: TWalletManager; walletId: string }) {
        if (!this._all[walletId]) {
            Vue.set(this._all, walletId, {});
        }
        Vue.set(this._all[walletId], walletManager._id, walletManager);
    }

    @Mutation
    unset(walletManager: TWalletManager) {
        Vue.delete(this._all[walletManager.walletId], walletManager._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async getWallet(payload: { sub: string; chainId: ChainId }) {
        const params = new URLSearchParams();
        params.append('chainId', String(payload.chainId));
        params.append('sub', String(payload.sub));

        const result = await axios({
            method: 'GET',
            url: `/wallets`,
            params,
        });

        if (!result.data.length) {
            return null;
        }
        const wallet = result.data[0];
        this.context.commit('setWallet', wallet);
    }

    @Action({ rawError: true })
    async list(wallet: TWallet) {
        const result = await axios({
            method: 'GET',
            url: `/wallets/${wallet._id}/managers`,
        });

        this.context.commit('clear');

        result.data.forEach((walletManager: TWalletManager) => {
            this.context.commit('set', { walletManager, walletId: wallet._id });
        });
    }

    @Action({ rawError: true })
    async create(payload: { wallet: TWallet; address: string }) {
        const walletManager = await axios({
            method: 'POST',
            url: `/wallets/${payload.wallet._id}/managers`,
            data: {
                address: payload.address,
            },
        });
        this.context.commit('set', { walletManager, walletId: payload.wallet._id });
    }

    @Action({ rawError: true })
    async remove(walletManager: TWalletManager) {
        await axios({
            method: 'DELETE',
            url: `/wallets/managers/${walletManager._id}`,
        });
        this.context.commit('unset', walletManager);
    }
}

export default WalletManagerModule;
