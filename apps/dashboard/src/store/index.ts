import Vue from 'vue';
import Vuex from 'vuex';

import AccountStore from './modules/account';
import PoolStore from './modules/pools';
import WidgetStore from './modules/widgets';
import ERC20Store from './modules/erc20';
import RewardCoinsStore from './modules/erc20Perks';
import ERC721Store from './modules/erc721';
import ERC1155Store from './modules/erc1155';
import RewardNFTsStore from './modules/erc721Perks';
import ClientStore from './modules/clients';
import BrandStore from './modules/brands';
import WebhookStore from './modules/webhooks';
import ImageStore from './modules/images';
import RewardsStore from './modules/rewards';
import CouponRewardsStore from './modules/couponRewards';
import DiscordRoleRewardsStore from './modules/discordRoleRewards';

Vue.use(Vuex);

const mutations = {};
const actions = {};
const getters = {};
const modules = {
    account: AccountStore,
    pools: PoolStore,
    widgets: WidgetStore,
    erc20: ERC20Store,
    erc20Perks: RewardCoinsStore,
    rewards: RewardsStore,
    couponRewards: CouponRewardsStore,
    discordRoleRewards: DiscordRoleRewardsStore,
    erc721: ERC721Store,
    erc1155: ERC1155Store,
    erc721Perks: RewardNFTsStore,
    clients: ClientStore,
    brands: BrandStore,
    webhooks: WebhookStore,
    images: ImageStore,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
