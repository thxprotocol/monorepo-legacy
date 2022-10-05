import { TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { signCall } from '@thxnetwork/wallet/utils/network';
import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { Membership } from './memberships';

@Module({ namespaced: true })
class ERC20SwapsModule extends VuexModule {
    @Action({ rawError: true })
    async create({
        membership,
        swapRule,
        amountInInWei,
        tokenInAddress,
    }: {
        membership: Membership;
        swapRule: TSwapRule;
        amountInInWei: string;
        tokenInAddress: string;
    }) {
        const web3 = this.context.rootGetters['network/all'][membership.chainId];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const { call, nonce, sig } = await signCall(
            web3,
            membership.poolAddress,
            'swap',
            [amountInInWei, tokenInAddress],
            privateKey,
        );

        await axios({
            method: 'POST',
            url: '/swaps',
            headers: {
                'X-PoolId': membership.poolId,
            },
            data: {
                call,
                nonce,
                sig,
                swapRuleId: swapRule._id,
                amountIn: amountInInWei,
                tokenInAddress,
            },
        });

        return true;
    }
}

export default ERC20SwapsModule;
