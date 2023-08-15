import Vue from 'vue';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { TPool, TWebhook } from '@thxnetwork/types/interfaces';
import { wrap } from 'module';

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

    @Mutation
    unset(webhook: TWebhook) {
        Vue.delete(this._all[webhook.poolId], String(webhook._id));
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
            wehbook.webhookRequests.map((wr) => {
                return {
                    event: wr.event,
                    payload: JSON.parse(wr.payload),
                };
            });
            this.context.commit('set', wehbook);
        }
    }

    @Action({ rawError: true })
    async create(webhook: TWebhook) {
        const { data } = await axios({
            method: 'POST',
            url: '/webhooks',
            headers: {
                'X-PoolId': webhook.poolId,
            },
            data: webhook,
        });
        this.context.commit('set', data);
    }

    @Action({ rawError: true })
    async update(webhook: TWebhook) {
        await axios({
            method: 'PATCH',
            url: '/webhooks/' + webhook._id,
            headers: {
                'X-PoolId': webhook.poolId,
            },
            data: webhook,
        });
        this.context.commit('set', webhook);
    }

    @Action({ rawError: true })
    async delete(webhook: TWebhook) {
        await axios({
            method: 'DELETE',
            url: '/webhooks/' + webhook._id,
            headers: {
                'X-PoolId': webhook.poolId,
            },
        });
        this.context.commit('unset', webhook);
    }
}

export default WebhooksModule;
