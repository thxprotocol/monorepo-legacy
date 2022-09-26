import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Reward } from '@thxprotocol/dashboard/types/rewards';

export class Widget {
    clientId: string;
    clientSecret: string;
    registrationAccessToken: string;
    requestUri: string;
    metadata: any;
    reward: Reward | null = null;

    constructor(data: any) {
        this.clientId = data.clientId;
        this.clientSecret = data.clientSecret;
        this.registrationAccessToken = data.registrationAccessToken;
        this.requestUri = data.requestUris[0];
        this.metadata = {
            height: 60,
            width: 310,
            rewardId: data.metadata.rewardId,
            poolAddress: data.metadata.poolAddress,
        };
    }

    setReward(reward: Reward) {
        this.reward = reward;
    }
}

export interface IWidgets {
    [poolAddress: string]: Widget[];
}

@Module({ namespaced: true })
class WidgetModule extends VuexModule {
    _all: IWidgets = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(widget: Widget) {
        if (!this._all[widget.metadata.poolAddress]) {
            Vue.set(this._all, widget.metadata.poolAddress, {});
        }
        Vue.set(this._all[widget.metadata.poolAddress], widget.clientId, widget);
    }

    @Mutation
    unset(data: { clientId: string; poolAddress: string }) {
        Vue.delete(this._all[data.poolAddress], data.clientId);
    }

    @Action({ rawError: true })
    async list(poolAddress: string) {
        const r = await axios({
            method: 'GET',
            url: '/widgets?asset_pool=' + poolAddress,
        });

        for (const rat of r.data) {
            const r = await axios({
                method: 'GET',
                url: '/widgets/' + rat,
            });

            this.context.commit('set', new Widget(r.data));
        }
    }

    @Action({ rawError: true })
    async create(data: {
        metadata: { rewardId: number; poolId: string };
        requestUris: string[];
        redirectUris: string[];
        postLogoutRedirectUris: string[];
    }) {
        await axios({
            method: 'POST',
            url: '/widgets',
            data,
            headers: { 'X-PoolId': data.metadata.poolId },
        });
    }

    @Action({ rawError: true })
    async remove(data: { clientId: string; poolId: string }) {
        await axios({
            method: 'DELETE',
            url: '/widgets/' + data.clientId,
        });

        this.context.commit('unset', { clientId: data.clientId, poolId: data.poolId });
    }
}

export default WidgetModule;
