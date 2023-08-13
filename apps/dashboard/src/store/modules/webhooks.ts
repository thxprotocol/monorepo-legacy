import Vue from 'vue';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { TPool, TWebhook } from '@thxnetwork/types/interfaces';

export type TWebhookState = {
    [poolId: string]: {
        [id: string]: TWebhook;
    };
};

@Module({ namespaced: true })
class WebhooksModule extends VuexModule {
    _all: TWebhookState = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(webhook: TWebhook) {
        if (!this._all[webhook.poolId]) Vue.set(this._all, webhook.poolId, {});
        Vue.set(this._all[webhook.poolId], String(webhook._id), webhook);
    }

    @Action({ rawError: true })
    async list(pool: TPool) {
        const { data } = await axios({
            method: 'GET',
            url: '/webhooks',
            headers: {
                'X-PoolId': pool._id,
            },
        });

        for (const wehbook of data) {
            this.context.commit('set', wehbook);
        }
    }

    @Action({ rawError: true })
    create(pool: TPool) {
        return axios({
            method: 'POST',
            url: '/webhooks',
            headers: {
                'X-PoolId': pool._id,
            },
        });
    }

    @Action({ rawError: true })
    update(webhook: TWebhook) {
        return axios({
            method: 'POST',
            url: '/webhooks',
            headers: {
                'X-PoolId': webhook.poolId,
            },
            data: {
                ...webhook,
            },
        });
    }

    @Action({ rawError: true })
    delete(webhook: TWebhook) {
        return axios({
            method: 'DELETE',
            url: '/webhooks/' + webhook._id,
            headers: {
                'X-PoolId': webhook.poolId,
            },
        });
    }
}

export default WebhooksModule;
