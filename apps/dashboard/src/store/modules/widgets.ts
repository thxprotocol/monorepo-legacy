import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { TBaseReward } from '@thxnetwork/types/index';
import { type IPool } from './pools';

export class Widget {
    clientId: string;
    clientSecret: string;
    registrationAccessToken: string;
    requestUri: string;
    metadata: any;
    reward: TBaseReward | null = null;

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

    setReward(reward: TBaseReward) {
        this.reward = reward;
    }
}

export type TWidget = {
    uuid: string;
    color: string;
    bgColor: string;
    poolId: string;
    theme: string;
};
export interface IWidgets {
    [poolId: string]: { [widgetUuid: string]: TWidget };
}

@Module({ namespaced: true })
class WidgetModule extends VuexModule {
    _all: IWidgets = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(widget: TWidget) {
        if (!this._all[widget.poolId]) {
            Vue.set(this._all, widget.poolId, {});
        }
        Vue.set(this._all[widget.poolId], widget.uuid, widget);
    }

    @Mutation
    unset(widget: TWidget) {
        Vue.delete(this._all[widget.poolId], widget.uuid);
    }

    @Action({ rawError: true })
    async list(pool: IPool) {
        const r = await axios({
            method: 'GET',
            url: '/widgets',
            headers: { 'X-PoolId': pool._id },
        });

        r.data.forEach((w: TWidget) => {
            this.context.commit('set', w);
        });
    }

    @Action({ rawError: true })
    async read(widget: TWidget) {
        const r = await axios({
            method: 'GET',
            url: `/widgets/${widget.uuid}`,
            headers: { 'X-PoolId': widget.poolId },
        });

        this.context.commit('set', r.data);
    }

    @Action({ rawError: true })
    async create(widget: TWidget) {
        const r = await axios({
            method: 'POST',
            url: '/widgets',
            data: widget,
            headers: { 'X-PoolId': widget.poolId },
        });

        this.context.commit('set', { ...widget, ...r.data });
    }

    @Action({ rawError: true })
    async update(widget: TWidget) {
        const r = await axios({
            method: 'PATCH',
            url: `/widgets/${widget.uuid}`,
            data: widget,
            headers: { 'X-PoolId': widget.poolId },
        });

        this.context.commit('set', { ...widget, ...r.data });
    }
}

export default WidgetModule;
