import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';
import { ISwapRules, TSwapRule } from '@thxnetwork/wallet/types/SwapRules';

@Module({ namespaced: true })
class ERC20SwapRuleModule extends VuexModule {
    _all: ISwapRules = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ swapRule, membership }: { swapRule: TSwapRule; membership: Membership }) {
        if (!this._all[membership._id]) {
            Vue.set(this._all, membership._id, {});
        }
        Vue.set(this._all[membership._id], swapRule._id, swapRule);
    }

    @Mutation
    unset({ swaprule, membership }: { swaprule: TSwapRule; membership: Membership }) {
        Vue.delete(this._all[membership._id], swaprule._id);
    }

    @Action({ rawError: true })
    async filter({ membership, page = 1, limit = 10 }: { membership: Membership; page: number; limit: number }) {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));

        const { data } = await axios({
            method: 'get',
            url: '/swaprules',
            params,
            headers: { 'X-PoolId': membership.poolId },
        });

        data.results.forEach((swapRule: TSwapRule) => {
            swapRule.page = page;
            this.context.commit('set', { swapRule, membership });
        });
    }
}

export default ERC20SwapRuleModule;
