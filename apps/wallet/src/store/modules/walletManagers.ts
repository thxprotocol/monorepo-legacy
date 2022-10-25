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
    unset({ walletManager, walletId }: { walletManager: TWalletManager; walletId: string }) {
        Vue.delete(this._all[walletId], walletManager._id);
    }

    @Action({ rawError: true })
    async getWallet(chainId: ChainId) {
        const params = new URLSearchParams();
        params.append('chainId', String(chainId));

        const result = await axios({
            method: 'get',
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
            method: 'get',
            url: `/wallets/${wallet._id}/managers`,
        });

        result.data.forEach((walletManager: TWalletManager) => {
            this.context.commit('set', { walletManager, walletId: wallet._id });
        });
    }
}

export default WalletManagerModule;
