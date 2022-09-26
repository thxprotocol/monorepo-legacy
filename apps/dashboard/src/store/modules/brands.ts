import axios from 'axios';
import Vue from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { IPool } from './pools';

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
    set({ pool, brand }: { pool: IPool; brand: TBrand }) {
        Vue.set(this._all, pool._id, brand);
    }

    @Action({ rawError: true })
    async getForPool(pool: IPool) {
        const { data } = await axios({
            url: '/brands',
            method: 'GET',
            headers: {
                'X-PoolId': pool._id,
            },
        });
        this.context.commit('set', { pool, brand: data });
    }

    @Action({ rawError: true })
    async update({ pool, brand }: { pool: IPool; brand: TBrand }) {
        const { data } = await axios({
            url: '/brands',
            method: 'PUT',
            headers: {
                'X-PoolId': pool._id,
            },
            data: brand,
        });

        this.context.commit('set', { pool, brand: data });
    }
}

export default BrandModule;
