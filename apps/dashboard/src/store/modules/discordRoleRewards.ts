import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardVariant } from '@thxnetwork/common/enums';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/common/mixpanel';

export type TRewardDiscordRoleState = {
    [poolId: string]: {
        [id: string]: TRewardDiscordRole;
    };
};

@Module({ namespaced: true })
class DiscordRoleRewardModule extends VuexModule {
    _discordRoleRewards: TRewardDiscordRoleState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._discordRoleRewards;
    }

    @Mutation
    set(reward: TRewardDiscordRole) {
        if (!this._discordRoleRewards[reward.poolId]) Vue.set(this._discordRoleRewards, reward.poolId, {});
        reward.variant = RewardVariant.DiscordRole;
        Vue.set(this._discordRoleRewards[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    unset(reward: TRewardDiscordRole) {
        Vue.delete(this._discordRoleRewards[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async create(reward: Partial<TRewardDiscordRole>) {
        const formData = prepareFormDataForUpload(reward);
        const { data } = await axios({
            method: 'POST',
            url: '/discord-role-rewards',
            headers: { 'X-PoolId': reward.poolId },
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'discord role reward']);

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async update(reward: Partial<TRewardDiscordRole>) {
        const formData = prepareFormDataForUpload(reward);
        const { data } = await axios({
            method: 'PATCH',
            url: `/discord-role-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
            data: formData,
        });

        this.context.commit('set', { ...reward, ...data });
    }

    @Action({ rawError: true })
    async delete(reward: Partial<TRewardDiscordRole>) {
        await axios({
            method: 'DELETE',
            url: `/discord-role-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default DiscordRoleRewardModule;
