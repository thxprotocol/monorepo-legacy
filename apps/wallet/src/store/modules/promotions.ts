import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { TMembership } from './memberships';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

export type TPromotion = {
    id: string;
    sub: string;
    title: string;
    description: string;
    value: string;
    price: number;
    poolAddress: string;
};

export interface IPromotions {
    [poolAddress: string]: {
        [pollId: string]: TPromotion;
    };
}

@Module({ namespaced: true })
class PromotionModule extends VuexModule {
    _all: IPromotions = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ promotion, membership }: { promotion: TPromotion; membership: TMembership }) {
        if (!this._all[membership._id]) {
            Vue.set(this._all, membership._id, {});
        }
        Vue.set(this._all[membership._id], promotion.id, promotion);
    }

    @Mutation
    unset({ promotion, membership }: { promotion: TPromotion; membership: TMembership }) {
        Vue.delete(this._all[membership._id], promotion.id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async filter({ membership, page = 1, limit = 10 }: { membership: TMembership; page: number; limit: number }) {
        const data = await thxClient.promotions.filter({ poolId: membership.poolId, page, limit });
        this.context.commit('clear');
        for (const promotion of data.results) {
            this.context.commit('set', { promotion, membership });
        }

        return { pagination: data };
    }
}

export default PromotionModule;
