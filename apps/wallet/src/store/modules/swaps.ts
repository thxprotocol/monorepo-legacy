import type { TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { TMembership } from './memberships';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

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
        const data = await thxClient.swaps.create({
            poolId: membership.poolId,
            swapRuleId: swapRule._id,
            amountInInWei: amountInInWei,
            tokenInAddress,
        });

        return data;
    }
}

export default ERC20SwapsModule;
