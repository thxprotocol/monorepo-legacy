import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { track } from '@thxnetwork/common/mixpanel';

@Module({ namespaced: true })
class DeveloperModule extends VuexModule {
    _clients: TClientState = {};
    _events: TEventState = {
        results: [],
        page: 0,
        total: 0,
        metadata: {
            eventTypes: [],
        },
    };
    _identities: TIdentityState = {
        results: [],
        page: 0,
        total: 0,
    };
    _webhooks: TWebhookState = {};

    get clients() {
        return this._clients;
    }

    get identities() {
        return this._identities;
    }

    get events() {
        return this._events;
    }

    get webhooks() {
        return this._webhooks;
    }

    @Mutation
    setWebhook(webhook: TWebhook) {
        webhook.webhookRequests.map((wr) => {
            const payload = JSON.parse(wr.payload);
            return { ...wr, payload };
        });
        Vue.set(this._webhooks, String(webhook._id), webhook);
    }

    @Mutation
    unsetWebhook(webhook: TWebhook) {
        Vue.delete(this._webhooks, String(webhook._id));
    }

    @Mutation
    setClient(client: TClient) {
        Vue.set(this._clients, client._id, client);
    }

    @Mutation
    setEvents(result: TEventState) {
        this._events = result;
    }

    @Mutation
    setIdentities(result: TIdentityState) {
        this._identities = result;
    }

    @Mutation
    unsetIdentity(identity: TIdentity) {
        const index = this._identities.results.findIndex((i) => i._id === identity._id);
        Vue.delete(this._identities.results, index);
    }

    // Clients

    @Action({ rawError: true })
    async listClients() {
        const { data } = await axios({
            method: 'GET',
            url: '/account/developer/clients',
        });

        data.forEach((client: TClient) => {
            this.context.commit('setClient', client);
        });
    }

    @Action({ rawError: true })
    async createClient({ payload }: { payload: TClient }) {
        const { data } = await axios({
            method: 'POST',
            url: '/account/developer/clients',
            data: payload,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'client']);

        this.context.commit('setClient', data);
    }

    @Action({ rawError: true })
    async updateClient({ payload }: { payload: TClient }) {
        const { data } = await axios({
            method: 'PATCH',
            url: '/account/developer/clients/' + payload._id,
            data: { name: payload.name },
        });

        this.context.commit('setClient', data);
    }

    @Action({ rawError: true })
    async getClient({ client }: { client: TClient }) {
        const { data } = await axios({
            method: 'GET',
            url: '/account/developer/clients/' + client._id,
        });

        const existingClient = this.context.rootGetters['clients/all'][client._id];
        const updatedClient = { ...existingClient, ...data };
        this.context.commit('setClient', updatedClient);
    }

    // Identities

    @Action({ rawError: true })
    async listIdentities(payload: { limit: number; page: number }) {
        const { data } = await axios({
            method: 'GET',
            url: `/account/developer/identities`,
            params: {
                limit: payload.limit,
                page: payload.page,
            },
        });

        this.context.commit('setIdentities', data);
    }

    @Action({ rawError: true })
    async createIdentity() {
        await axios({
            method: 'POST',
            url: `/account/developer/identities`,
        });
    }

    @Action({ rawError: true })
    async removeIdentity(identity: TIdentity) {
        await axios({
            method: 'DELETE',
            url: `/account/developer/identities/${identity._id}`,
        });
        this.context.commit('unsetIdentity', identity);
    }

    // Events

    @Action({ rawError: true })
    async listEvents(options = { page: 1, limit: 10 }) {
        const { data } = await axios({
            method: 'GET',
            url: `/account/developer/events`,
            params: { page: options.page, limit: options.limit },
        });
        this.context.commit('setEvents', data as TEventState);
    }

    // Webhooks

    @Action({ rawError: true })
    async listWebhooks() {
        const { data } = await axios({
            method: 'GET',
            url: '/account/developer/webhooks',
        });

        for (const webhook of data) {
            this.context.commit('setWebhook', webhook);
        }
    }

    @Action({ rawError: true })
    async createWebhook(webhook: TWebhook) {
        const { data } = await axios({
            method: 'POST',
            url: '/account/developer/webhooks',
            data: webhook,
        });
        this.context.commit('setWebhook', data);
    }

    @Action({ rawError: true })
    async updateWebhook(webhook: TWebhook) {
        await axios({
            method: 'PATCH',
            url: '/account/developer/webhooks/' + webhook._id,
            data: { url: webhook.url },
        });
        this.context.commit('setWebhook', webhook);
    }

    @Action({ rawError: true })
    async deleteWebhook(webhook: TWebhook) {
        await axios({
            method: 'DELETE',
            url: '/account/developer/webhooks/' + webhook._id,
        });
        this.context.commit('unsetWebhook', webhook);
    }
}

export default DeveloperModule;
