import Vue from 'vue';
import Vuex from 'vuex';

import AccountStore from './modules/account';
import PoolStore from './modules/pools';
import PointRewardStore from './modules/pointRewards';
import WidgetStore from './modules/widgets';
import ERC20Store from './modules/erc20';
import ERC20PerksStore from './modules/erc20Perks';
import ERC721Store from './modules/erc721';
import ERC1155Store from './modules/erc1155';
import ERC721PerksStore from './modules/erc721Perks';
import Web3QuestStore from './modules/web3Quests';
import ReferralRewardRewardsStore from './modules/referralRewards';
import ReferralRewardRewardClaimsStore from './modules/referralRewardClaims';
import ClientStore from './modules/clients';
import BrandStore from './modules/brands';
import WebhookStore from './modules/webhooks';
import ImageStore from './modules/images';
import MilestoneRewardStore from './modules/milestoneRewards';
import DailyRewardStore from './modules/dailyRewards';
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
    pointRewards: PointRewardStore,
    widgets: WidgetStore,
    erc20: ERC20Store,
    erc20Perks: ERC20PerksStore,
    rewards: RewardsStore,
    couponRewards: CouponRewardsStore,
    discordRoleRewards: DiscordRoleRewardsStore,
    erc721: ERC721Store,
    erc1155: ERC1155Store,
    erc721Perks: ERC721PerksStore,
    web3Quests: Web3QuestStore,
    referralRewards: ReferralRewardRewardsStore,
    referralRewardClaims: ReferralRewardRewardClaimsStore,
    clients: ClientStore,
    brands: BrandStore,
    webhooks: WebhookStore,
    images: ImageStore,
    milestoneRewards: MilestoneRewardStore,
    dailyRewards: DailyRewardStore,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
