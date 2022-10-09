import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import {
  GetERC20SwapRulesProps,
  IERC20SwapRules,
  TERC20SwapRule,
} from '@thxnetwork/dashboard/types/IERC20SwapRules';

@Module({ namespaced: true })
class ERC20SwapRuleModule extends VuexModule {
  _all: IERC20SwapRules = {};
  _totals: { [poolId: string]: number } = {};

  get all() {
    return this._all;
  }

  get totals() {
    return this._totals;
  }

  @Mutation
  set({ pool, swapRule }: { pool: IPool; swapRule: TERC20SwapRule }) {
    if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
    Vue.set(this._all[pool._id], swapRule._id, swapRule);
  }

  @Mutation
  setTotal({ pool, total }: { pool: IPool; total: number }) {
    Vue.set(this._totals, pool._id, total);
  }

  @Action({ rawError: true })
  async list({ page = 1, limit, pool }: GetERC20SwapRulesProps) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    const { data } = await axios({
      method: 'GET',
      url: '/swaprules?' + params.toString(),
      headers: { 'X-PoolId': pool._id },
    });

    this.context.commit('setTotal', { pool, total: data.total });
    data.results.forEach((swapRule: TERC20SwapRule) => {
      swapRule.page = page;
      this.context.commit('set', { pool: pool, swapRule });
    });
  }

  @Action({ rawError: true })
  async create(payload: {
    page: number;
    pool: IPool;
    tokenInAddress: string;
    tokenMultiplier: number;
  }) {
    const { data } = await axios({
      method: 'POST',
      url: '/swaprules',
      headers: { 'X-PoolId': payload.pool._id },
      data: {
        tokenInAddress: payload.tokenInAddress,
        tokenMultiplier: Number(payload.tokenMultiplier),
        pool: payload.pool,
      },
    });
    data.page = payload.page;
    this.context.commit('set', { pool: payload.pool, swapRule: data });
  }
}
export default ERC20SwapRuleModule;
