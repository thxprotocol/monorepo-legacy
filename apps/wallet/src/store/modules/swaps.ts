import axios from 'axios';
import { TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { TMembership } from './memberships';

@Module({ namespaced: true })
class ERC20SwapsModule extends VuexModule {
  @Action({ rawError: true })
  async create({
    membership,
    swapRule,
    amountInInWei,
    tokenInAddress,
  }: {
    membership: TMembership;
    swapRule: TSwapRule;
    amountInInWei: string;
    tokenInAddress: string;
  }) {
    await axios({
      method: 'POST',
      url: '/swaps',
      headers: {
        'X-PoolId': membership.poolId,
      },
      data: {
        swapRuleId: swapRule._id,
        amountIn: amountInInWei,
        tokenInAddress,
      },
    });
  }
}

export default ERC20SwapsModule;
