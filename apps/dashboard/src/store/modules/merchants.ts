import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { TMerchant } from '@thxnetwork/types/merchant';

export type TMerchantState = {
    [poolId: string]: {
        [id: string]: TMerchant;
    };
};

@Module({ namespaced: true })
class DailyRewardModule extends VuexModule {
    @Action({ rawError: true })
    create() {
        return axios({
            method: 'POST',
            url: '/merchants',
        });
    }
}

export default DailyRewardModule;
