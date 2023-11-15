import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardVariant } from '@thxnetwork/types/enums';
import type { TDiscordRoleReward, TPool } from '@thxnetwork/types/interfaces';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';

export type TDiscordRoleRewardState = {
    [poolId: string]: {
        [id: string]: TDiscordRoleReward;
    };
};

@Module({ namespaced: true })
class DiscordRoleRewardModule extends VuexModule {
    _discordRoleRewards: TDiscordRoleRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._discordRoleRewards;
    }

    @Mutation
    set(reward: TDiscordRoleReward) {
        if (!this._discordRoleRewards[reward.poolId]) Vue.set(this._discordRoleRewards, reward.poolId, {});
        reward.variant = RewardVariant.DiscordRole;
        Vue.set(this._discordRoleRewards[reward.poolId], String(reward._id), reward);
    }

    @Mutation
    unset(reward: TDiscordRoleReward) {
        Vue.delete(this._discordRoleRewards[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }) {
        const { data } = await axios({
            method: 'GET',
            url: '/discord-role-rewards',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TDiscordRoleReward) => {
            reward.page = page;
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(reward: Partial<TDiscordRoleReward>) {
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
    async update(reward: Partial<TDiscordRoleReward>) {
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
    async delete(reward: Partial<TDiscordRoleReward>) {
        await axios({
            method: 'DELETE',
            url: `/discord-role-rewards/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default DiscordRoleRewardModule;
