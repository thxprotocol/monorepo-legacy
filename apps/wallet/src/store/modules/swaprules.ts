import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { TMembership } from './memberships';
import { ISwapRules, TSwapRule } from '@thxnetwork/wallet/types/SwapRules';

@Module({ namespaced: true })
class ERC20SwapRuleModule extends VuexModule {
  _all: ISwapRules = {};
  totals: { [membershipId: string]: number } = {};

  get all() {
    return this._all;
  }

  @Mutation
  set({
    swapRule,
    membership,
  }: {
    swapRule: TSwapRule;
    membership: TMembership;
  }) {
    if (!this._all[membership._id]) {
      Vue.set(this._all, membership._id, {});
    }
    Vue.set(this._all[membership._id], swapRule._id, swapRule);
  }

  @Mutation
  setTotal({ membership, total }: { membership: TMembership; total: number }) {
    Vue.set(this.totals, membership._id, total);
  }

  @Mutation
  unset({
    swaprule,
    membership,
  }: {
    swaprule: TSwapRule;
    membership: TMembership;
  }) {
    Vue.delete(this._all[membership._id], swaprule._id);
  }

  @Action({ rawError: true })
  async filter({
    membership,
    page = 1,
    limit = 10,
  }: {
    membership: TMembership;
    page: number;
    limit: number;
  }) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));

    const { data } = await axios({
      method: 'get',
      url: '/swaprules',
      params,
      headers: { 'X-PoolId': membership.poolId },
    });

    this.context.commit('setTotal', { membership, total: data.total });

    data.results.forEach((swapRule: TSwapRule) => {
      swapRule.page = page;
      this.context.commit('set', { swapRule, membership });
    });
  }
}

export default ERC20SwapRuleModule;
