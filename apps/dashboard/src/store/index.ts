import Vue from 'vue';
import Vuex from 'vuex';

import AccountStore from './modules/account';
import PoolStore from './modules/pools';
import PromotionStore from './modules/promotions';
import PointRewardStore from './modules/pointRewards';
import WidgetStore from './modules/widgets';
import ERC20Store from './modules/erc20';
import ERC20PerksStore from './modules/erc20Perks';
import ERC721Store from './modules/erc721';
import ERC721PerksStore from './modules/erc721Perks';
import ReferralRewardRewardsStore from './modules/referralRewards';
import PaymentStore from './modules/payments';
import TransactionStore from './modules/transactions';
import SwapRuleStore from './modules/swaprules';
import ClientStore from './modules/clients';
import BrandStore from './modules/brands';
import ImageStore from './modules/images';

Vue.use(Vuex);

const mutations = {};
const actions = {};
const getters = {};
const modules = {
    account: AccountStore,
    pools: PoolStore,
    promotions: PromotionStore,
    pointRewards: PointRewardStore,
    widgets: WidgetStore,
    erc20: ERC20Store,
    erc20Perks: ERC20PerksStore,
    erc721: ERC721Store,
    erc721Perks: ERC721PerksStore,
    referralRewards: ReferralRewardRewardsStore,
    payments: PaymentStore,
    transactions: TransactionStore,
    swaprules: SwapRuleStore,
    clients: ClientStore,
    brands: BrandStore,
    images: ImageStore,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
