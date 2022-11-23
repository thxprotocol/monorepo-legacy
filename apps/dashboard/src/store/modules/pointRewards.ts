import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IChannel, IChannelAction, IRewardCondition, Reward } from '@thxnetwork/dashboard/types/rewards';
import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';

@Module({ namespaced: true })
class PointRewardModule extends VuexModule {
    _all: TPointReward[] = [];

    @Mutation
    set(reward: TPointReward) {
        Vue.set(this._all, reward._id, reward);
    }

    @Action({ rawError: true })
    async list(poolId: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/point-rewards',
            headers: { 'X-PoolId': poolId },
        });

        data.results.forEach((reward: TPointReward) => {
            this.context.commit('set', reward);
        });
    }

    @Action({ rawError: true })
    async create(payload: {
        poolId: string;
        title: string;
        description: string;
        amount: string;
        platform?: IChannel;
        interaction?: IChannelAction;
        content?: string;
    }) {
        const r = await axios({
            method: 'POST',
            url: '/point-rewards',
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });

        this.context.commit('set', { pool: payload.poolId, reward: r.data });
    }
}

export default PointRewardModule;
