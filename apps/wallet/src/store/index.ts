import Vuex from 'vuex';
import { Vue } from 'vue-property-decorator';
import { config } from 'vuex-module-decorators';

// Set rawError to true by default on all @Action({ rawError: true }) decorators
config.rawError = true;

import AccountStore from './modules/account';
import NetworkStore from './modules/network';
import MetamaskStore from './modules/metamask';
import AssetPoolStore from './modules/assetPools';
import MembershipStore from './modules/memberships';
import ERC20Store from './modules/erc20';
import ERC721Store from './modules/erc721';
import WithdrawalStore from './modules/withdrawals';
import PromotionStore from './modules/promotions';
import DepositStore from './modules/deposits';
import PaymentStore from './modules/payments';
import SwapRuleStore from './modules/swaprules';
import SwapStore from './modules/swaps';
import TransactionStore from './modules/transactions';

Vue.use(Vuex);

const mutations = {};
const actions = {};
const getters = {};
const modules = {
    account: AccountStore,
    network: NetworkStore,
    metamask: MetamaskStore,
    assetpools: AssetPoolStore,
    memberships: MembershipStore,
    erc20: ERC20Store,
    erc721: ERC721Store,
    deposits: DepositStore,
    withdrawals: WithdrawalStore,
    promotions: PromotionStore,
    payments: PaymentStore,
    swaprules: SwapRuleStore,
    swaps: SwapStore,
    transactions: TransactionStore,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
