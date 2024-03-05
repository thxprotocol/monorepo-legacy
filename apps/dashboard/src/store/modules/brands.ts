import axios from 'axios';
import Vue from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

export interface TBrand {
    logoImgUrl: string;
    backgroundImgUrl: string;
}

export interface TBrandState {
    [poolId: string]: TBrand;
}

@Module({ namespaced: true })
class BrandModule extends VuexModule {
    _all: TBrandState = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ poolId, brand }: { poolId: string; brand: TBrand }) {
        Vue.set(this._all, poolId, brand);
    }

    @Action({ rawError: true })
    async getForPool(poolId: string) {
        const { data } = await axios({
            url: '/brands',
            method: 'GET',
            headers: {
                'X-PoolId': poolId,
            },
        });
        this.context.commit('set', { poolId, brand: data });
    }

    @Action({ rawError: true })
    async update({ pool, brand }: { pool: TPool; brand: TBrand }) {
        const { data } = await axios({
            url: '/brands',
            method: 'PUT',
            headers: {
                'X-PoolId': pool._id,
            },
            data: brand,
        });

        this.context.commit('set', { poolId: pool._id, brand: data });
    }
}

export default BrandModule;
