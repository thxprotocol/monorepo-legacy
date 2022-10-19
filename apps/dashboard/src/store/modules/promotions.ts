import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { IPromotions } from '@thxnetwork/dashboard/types/IPromotions';
import type { IPool } from './pools';

export type TPromotion = {
  _id: string;
  id: string;
  poolAddress: string;
  title: string;
  description: string;
  value: string;
  price: number;
};

@Module({ namespaced: true })
class RewardModule extends VuexModule {
  _all: IPromotions = {};

  get all() {
    return this._all;
  }

  @Mutation
  set({ pool, promotion }: { pool: IPool; promotion: TPromotion }) {
    if (!this._all[pool._id]) {
      Vue.set(this._all, pool._id, {});
    }
    Vue.set(this._all[pool._id], promotion._id, promotion);
  }

  @Mutation
  remove({ pool, promotion }: { pool: IPool; promotion: TPromotion }) {
    Vue.delete(this._all[pool._id], promotion._id);

    if (!Object.values(this._all[pool._id]).length) {
      Vue.delete(this._all, pool._id);
    }
  }

  @Action({ rawError: true })
  async list(pool: IPool) {
    const r = await axios({
      method: 'GET',
      url: '/promotions',
      headers: { 'X-PoolId': pool._id },
    });

    for (const promotion of r.data.results) {
      this.context.commit('set', { promotion, pool });
    }
  }

  @Action({ rawError: true })
  async read({ pool, id }: { pool: IPool; id: string }) {
    const r = await axios({
      method: 'GET',
      url: '/promotions/' + id,
      headers: { 'X-PoolId': pool._id },
    });

    this.context.commit('set', { pool, promotion: r.data });
  }

  @Action({ rawError: true })
  async create({ pool, promotion }: { pool: IPool; promotion: TPromotion }) {
    const { data } = await axios({
      method: 'POST',
      url: '/promotions',
      headers: { 'X-PoolId': pool._id },
      data: promotion,
    });

    this.context.commit('set', { promotion: data, pool });
  }

  @Action({ rawError: true })
  async delete({ pool, promotion }: { pool: IPool; promotion: TPromotion }) {
    await axios({
      method: 'DELETE',
      url: '/promotions/' + promotion._id,
      headers: { 'X-PoolId': pool._id },
    });

    this.context.commit('remove', { pool, promotion });
  }
}

export default RewardModule;
