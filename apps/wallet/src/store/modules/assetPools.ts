import { thxClient } from '@thxnetwork/wallet/utils/oidc';
import { Module, VuexModule, Action } from 'vuex-module-decorators';

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    @Action({ rawError: true })
    async getClaim(claimUuid: string) {
        return await thxClient.claims.get(claimUuid);
    }

    @Action({ rawError: true })
    async claimReward(claimUuid: string) {
        const claim = await this.context.dispatch('getClaim', claimUuid);
        return await thxClient.claims.collect({ poolId: claim.claim.poolId, claimUuid });
    }
}

export default AssetPoolModule;
