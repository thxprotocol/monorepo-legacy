import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { TMerchant } from '@thxnetwork/types/merchant';
import { type TPool } from '@thxnetwork/types/index';

export type TMerchantState = {
    [poolId: string]: {
        [id: string]: TMerchant;
    };
};

@Module({ namespaced: true })
class MerchantsModule extends VuexModule {
    _merchant: TMerchant | null = null;

    get merchant() {
        return this._merchant;
    }

    @Mutation
    setMerchant(merchant: TMerchant) {
        this._merchant = merchant;
    }

    @Action({ rawError: true })
    async read() {
        const { data } = await axios({
            method: 'GET',
            url: '/merchants',
        });
        this.context.commit('setMerchant', data);
    }

    @Action({ rawError: true })
    create() {
        return axios({
            method: 'POST',
            url: '/merchants',
        });
    }

    @Action({ rawError: true })
    delete() {
        return axios({
            method: 'DELETE',
            url: '/merchants',
        });
    }

    @Action({ rawError: true })
    async createLink(pool: TPool) {
        const { data } = await axios({
            method: 'POST',
            url: '/merchants/link',
            headers: {
                'X-PoolId': pool._id,
            },
        });

        window.open(data.accountLink.url, '_blank');
    }
}

export default MerchantsModule;
