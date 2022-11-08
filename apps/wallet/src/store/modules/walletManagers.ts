import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IWalletManagers, type TWalletManager } from '@thxnetwork/wallet/types/WalletManagers';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import type { TWallet } from '@thxnetwork/wallet/types/Wallet';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

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
        const wallets = await thxClient.walletManager.list(payload.chainId, payload.sub);
        if (!wallets.length) {
            return null;
        }
        this.context.commit('setWallet', wallets[0]);
    }

    @Action({ rawError: true })
    async list(wallet: TWallet) {
        const result = await thxClient.walletManager.getManagers(wallet._id);

        this.context.commit('clear');

        result.forEach((walletManager: TWalletManager) => {
            this.context.commit('set', { walletManager, walletId: wallet._id });
        });
    }

    @Action({ rawError: true })
    async create(payload: { wallet: TWallet; address: string }) {
        const walletManager = await thxClient.walletManager.addManager(payload.wallet._id, payload.address);
        this.context.commit('set', { walletManager, walletId: payload.wallet._id });
    }

    @Action({ rawError: true })
    async remove(walletManager: TWalletManager) {
        await thxClient.walletManager.deleteManager(walletManager._id);
        this.context.commit('unset', walletManager);
    }
}

export default WalletManagerModule;
