import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';

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
    set({ promotion, membership }: { promotion: TPromotion; membership: Membership }) {
        if (!this._all[membership._id]) {
            Vue.set(this._all, membership._id, {});
        }
        Vue.set(this._all[membership._id], promotion.id, promotion);
    }

    @Mutation
    unset({ promotion, membership }: { promotion: TPromotion; membership: Membership }) {
        Vue.delete(this._all[membership._id], promotion.id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async filter({ membership, page = 1, limit = 10 }: { membership: Membership; page: number; limit: number }) {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));

        const r = await axios({
            method: 'GET',
            url: '/promotions',
            params,
            headers: { 'X-PoolId': membership.poolId },
        });

        this.context.commit('clear');

        for (const promotion of r.data.results) {
            this.context.commit('set', { promotion, membership });
        }

        return { pagination: r.data };
    }
}

export default PromotionModule;
