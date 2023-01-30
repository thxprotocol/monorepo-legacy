import { track } from '@thxnetwork/mixpanel';
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
        let uuid: string | null = claimUuid;
        if (!uuid) {
            uuid = localStorage.getItem(`thx:wallet:claimUuid`);
        }
        const claim = await this.context.dispatch('getClaim', claimUuid);
        const profile = this.context.rootGetters['account/profile'];
        const claimed = await thxClient.claims.collect({ poolId: claim.claim.poolId, claimUuid });

        track('UserCreates', [profile.sub, 'perk claim']);

        return claimed;
    }
}

export default AssetPoolModule;
