import type {
    TAccount,
    TDiscordGuild,
    TEvent,
    TPaginationResult,
    TPool,
    TPoolSettings,
    TPoolTransferResponse,
    TQuest,
    TQuestEntry,
} from '@thxnetwork/types/interfaces';
import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { track } from '@thxnetwork/mixpanel';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

export interface IPoolAnalytic {
    _id: string;
    erc20Perks: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    erc721Perks: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    customRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    couponRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    discordRoleRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];

    //
    dailyRewards: [
        {
            day: string;
            totalClaimPoints: number;
        },
    ];
    referralRewards: [
        {
            day: string;
            totalClaimPoints: number;
        },
    ];
    pointRewards: [
        {
            day: string;
            totalClaimPoints: number;
        },
    ];
    milestoneRewards: [
        {
            day: string;
            totalClaimPoints: number;
        },
    ];
    web3Quests: [
        {
            day: string;
            totalClaimPoints: number;
        },
    ];
}

export interface IPoolAnalyticLeaderBoard {
    _id: string;
    score: number;
    account: TAccount;
}

export type PoolMetric = {
    totalCreated: number;
    totalCompleted: number;
    totalAmount: number;
};

export interface IPoolAnalyticMetrics {
    _id: string;
    participantActiveCount: number;
    participantCount: number;
    subscriptionCount: number;
    dailyQuest: PoolMetric;
    socialQuest: PoolMetric;
    inviteQuest: PoolMetric;
    customQuest: PoolMetric;
    web3Quest: PoolMetric;
    coinReward: PoolMetric;
    nftReward: PoolMetric;
    customReward: PoolMetric;
    couponReward: PoolMetric;
    discordRoleReward: PoolMetric;
}
export interface IPools {
    [id: string]: TPool;
}

export interface IPoolAnalytics {
    [id: string]: IPoolAnalytic;
}

export interface IPoolAnalyticsLeaderBoard {
    [id: string]: IPoolAnalyticLeaderBoard[];
}

export interface IPoolAnalyticsMetrics {
    [id: string]: IPoolAnalyticMetrics;
}

export type TQuestState = {
    [poolId: string]: {
        total: number;
        limit: number;
        page: number;
        results: TQuest[];
    };
};

export type TQuestEntryState = {
    [poolId: string]: {
        [questId: string]: TQuestEntry[];
    };
};

export type TGuildState = {
    [poolId: string]: {
        [guildId: string]: TDiscordGuild;
    };
};

export type TEventState = {
    [poolId: string]: {
        [eventId: string]: TEvent[];
    };
};

@Module({ namespaced: true })
class PoolModule extends VuexModule {
    _all: IPools = {};
    _guilds: TGuildState = {};
    _quests: TQuestState = {};
    _entries: TQuestEntryState = {};
    _events: TEventState = {};
    _analytics: IPoolAnalytics = {};
    _analyticsLeaderBoard: IPoolAnalyticsLeaderBoard = {};
    _analyticsMetrics: IPoolAnalyticsLeaderBoard = {};

    get all() {
        return this._all;
    }

    get guilds() {
        return this._guilds;
    }

    get quests() {
        return this._quests;
    }

    get events() {
        return this._events;
    }

    get entries() {
        return this._entries;
    }

    get analytics() {
        return this._analytics;
    }

    get analyticsLeaderBoard() {
        return this._analyticsLeaderBoard;
    }

    get analyticsMetrics() {
        return this._analyticsMetrics;
    }

    @Mutation
    set(pool: TPool) {
        Vue.set(this._all, pool._id, pool);
    }

    @Mutation
    clearTransfers(pool: TPool) {
        Vue.set(this._all[pool._id], 'transfers', []);
    }

    @Mutation
    setTransfer(poolTransfer: TPoolTransferResponse) {
        const pool = this._all[poolTransfer.poolId] as TPool & { transfers: TPoolTransferResponse[] };
        poolTransfer.isCopied = false;
        poolTransfer.url = `${BASE_URL}/preview/${pool._id}?token=${poolTransfer.token}`;

        const transfers = [...(pool.transfers ? pool.transfers : []), poolTransfer];
        Vue.set(this._all[pool._id], 'transfers', transfers);
    }

    @Mutation
    setAnalytics(data: IPoolAnalytic) {
        Vue.set(this._analytics, data._id, data);
    }

    @Mutation
    setAnalyticsLeaderBoard({ poolId, data }: { poolId: string; data: IPoolAnalyticLeaderBoard }) {
        Vue.set(this._analyticsLeaderBoard, poolId, data);
    }

    @Mutation
    setAnalyticsMetrics(data: IPoolAnalyticMetrics) {
        Vue.set(this._analyticsMetrics, data._id, data);
    }

    @Mutation
    unset(pool: TPool) {
        Vue.delete(this._all, pool._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Mutation
    setQuests({ poolId, result }: { poolId: string; result: { results: TQuest[] } & TPaginationResult }) {
        Vue.set(this._quests, poolId, result);
    }

    @Mutation
    setEvents({ poolId, result }: { poolId: string; result: { results: TEvent[] } & TPaginationResult }) {
        Vue.set(this._events, poolId, result);
    }

    @Mutation
    setQuest(quest: TQuest) {
        if (!this._quests[quest.poolId]) return;

        const quests = this._quests[quest.poolId].results;
        const index = quests.findIndex((q) => q._id === quest._id);

        Vue.set(this._quests[quest.poolId].results, index, quest);
    }

    @Mutation
    unsetQuest(quest: TQuest) {
        const quests = this._quests[quest.poolId].results;
        const index = quests.findIndex((q) => q._id === quest._id);
        Vue.delete(this._quests[quest.poolId].results, index);
    }

    @Mutation
    setQuestEntries({ entries, quest }: { entries: TQuestEntry[]; quest: TQuest }) {
        if (!this._entries[quest.poolId]) Vue.set(this._entries, quest.poolId, {});
        Vue.set(this._entries[quest.poolId], String(quest._id), entries);
    }

    @Mutation
    setGuild(guild: TDiscordGuild) {
        if (!this._guilds[guild.poolId]) Vue.set(this._guilds, guild.poolId, {});
        Vue.set(this._guilds[guild.poolId], guild._id, { ...guild, isShownSecret: false });
    }

    @Mutation
    unsetGuild(guild: TDiscordGuild) {
        Vue.delete(this._guilds[guild.poolId], guild._id);
    }

    @Action({ rawError: true })
    async listEvents({ pool, page, limit }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/events`,
            headers: { 'X-PoolId': pool._id },
            params: { page, limit },
        });
        this.context.commit('setEvents', { poolId: pool._id, result: data });
    }

    @Action
    async removeGuild(payload: TDiscordGuild) {
        await axios({
            method: 'DELETE',
            url: `/pools/${payload.poolId}/guilds/${payload._id}`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        this.context.commit('unsetGuild', payload);
    }

    @Action
    async updateGuild(payload: TDiscordGuild) {
        await axios({
            method: 'PATCH',
            url: `/pools/${payload.poolId}/guilds/${payload._id}`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        this.context.commit('setGuild', payload);
    }

    @Action
    async createGuild(payload: TDiscordGuild) {
        const { data } = await axios({
            method: 'POST',
            url: `/pools/${payload.poolId}/guilds`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        this.context.commit('setGuild', data);
    }

    @Action
    async createQuest(payload: TQuest) {
        await axios({
            method: 'POST',
            url: `/pools/${payload.poolId}/quests`,
            headers: { 'X-PoolId': payload.poolId },
            data: prepareFormDataForUpload(payload),
        });
    }

    @Action
    async patchQuest(payload: TQuest) {
        await axios({
            method: 'PATCH',
            url: `/pools/${payload.poolId}/quests/${payload._id}`,
            headers: { 'X-PoolId': payload.poolId },
            data: prepareFormDataForUpload(payload),
        });
    }

    @Action
    async removeQuest(payload: TQuest) {
        await axios({
            method: 'DELETE',
            url: `/pools/${payload.poolId}/quests/${payload._id}`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        this.context.commit('unsetQuest', payload);
    }

    @Action({ rawError: true })
    async listQuests({ pool, page, limit, isPublished }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/quests`,
            headers: { 'X-PoolId': pool._id },
            params: { page, limit, isPublished },
        });
        data.results = data.results.map((q) => {
            q.delete = (payload: TQuest) => this.context.dispatch('deleteQuest', payload);
            q.update = (payload: TQuest) => this.context.dispatch('updateQuest', payload);
            return q;
        });
        this.context.commit('setQuests', { poolId: pool._id, result: data });
    }

    @Action
    async deleteQuest(quest: TQuest) {
        this.context.dispatch('pools/removeQuest', quest, { root: true });
    }

    @Action
    async updateQuest(quest: TQuest) {
        switch (quest.variant) {
            case QuestVariant.Daily:
                return this.context.dispatch('dailyRewards/update', quest, { root: true });
            case QuestVariant.Invite:
                return this.context.dispatch('referralRewards/update', quest, { root: true });
            case QuestVariant.Discord:
            case QuestVariant.YouTube:
            case QuestVariant.Twitter:
                return this.context.dispatch('pointRewards/update', quest, { root: true });
            case QuestVariant.Custom:
                return this.context.dispatch('milestoneRewards/update', quest, { root: true });
            case QuestVariant.Web3:
                return this.context.dispatch('web3Quests/update', quest, { root: true });
            case QuestVariant.Gitcoin:
                return this.context.dispatch('pools/patchQuest', quest, { root: true });
        }
    }

    @Action({ rawError: true })
    async listEntries(quest: TQuest) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${quest.poolId}/quests/${quest._id}/entries`,
            headers: { 'X-PoolId': quest.poolId },
        });
        this.context.commit('setQuestEntries', { quest, entries: data });
    }

    @Action({ rawError: true })
    async listTransfers(pool: TPool) {
        this.context.commit('clearTransfers', pool);

        const r = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/transfers`,
            headers: { 'X-PoolId': pool._id },
        });

        r.data.forEach((poolTransfer: TPoolTransferResponse) => {
            this.context.commit('setTransfer', poolTransfer);
        });
    }

    @Action({ rawError: true })
    async refreshTransfers(pool: TPool & { transfers: TPoolTransferResponse[] }) {
        await axios({
            method: 'POST',
            url: `/pools/${pool._id}/transfers/refresh`,
            headers: { 'X-PoolId': pool._id },
            data: { token: pool.transfers[0].token },
        });
        this.context.dispatch('listTransfers', pool);
    }

    @Action({ rawError: true })
    async deleteTransfers(pool: TPool & { transfers: TPoolTransferResponse[] }) {
        await axios({
            method: 'DELETE',
            url: `/pools/${pool._id}/transfers`,
            headers: { 'X-PoolId': pool._id },
            data: { token: pool.transfers[0].token },
        });
        this.context.dispatch('listTransfers', pool);
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        this.context.commit('clear');

        const r = await axios({
            method: 'GET',
            url: '/pools',
            params,
        });

        r.data.forEach((pool: TPool) => {
            this.context.commit('set', pool);
        });
    }

    @Action({ rawError: true })
    async read(_id: string) {
        const r = await axios({
            method: 'get',
            url: '/pools/' + _id,
            headers: { 'X-PoolId': _id },
        });

        this.context.commit('set', r.data);

        r.data.guilds.forEach((guild: TDiscordGuild) => this.context.commit('setGuild', guild));

        return r.data;
    }

    @Action({ rawError: true })
    async readAnalytics(payload: { poolId: string; startDate: Date; endDate: Date }) {
        const r = await axios({
            method: 'get',
            url: `/pools/${payload.poolId}/analytics`,
            params: { startDate: payload.startDate, endDate: payload.endDate },
            headers: { 'X-PoolId': payload.poolId },
        });
        this.context.commit('setAnalytics', r.data);
        return r.data;
    }

    @Action({ rawError: true })
    async readAnalyticsMetrics(payload: { poolId: string }) {
        const r = await axios({
            method: 'get',
            url: `/pools/${payload.poolId}/analytics/metrics`,
            headers: { 'X-PoolId': payload.poolId },
        });
        this.context.commit('setAnalyticsMetrics', { _id: payload.poolId, ...r.data });
        return r.data;
    }

    @Action({ rawError: true })
    async participants({ pool, page, limit, sort }: { pool: TPool; page: string; limit: string; sort: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/participants`,
            headers: { 'X-PoolId': pool._id },
            params: {
                page,
                limit,
                sort,
            },
        });
        return data;
    }

    @Action({ rawError: true })
    async create(payload: {
        network: number;
        token: string;
        erc20tokens: string[];
        erc721tokens: string[];
        variant: string;
        title: string;
        endDate: string;
    }) {
        const { data } = await axios({
            method: 'POST',
            url: '/pools',
            data: payload,
        });

        const r = await axios({
            method: 'GET',
            url: '/pools/' + data._id,
            headers: { 'X-PoolId': data._id },
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'pool']);

        this.context.commit('set', r.data);
    }

    @Action({ rawError: true })
    async update({ pool, data }: { pool: TPool; data: { settings: TPoolSettings } }) {
        const res = await axios({
            method: 'PATCH',
            url: '/pools/' + pool._id,
            data,
            headers: { 'X-PoolId': pool._id },
        });

        this.context.commit('set', { ...pool, ...res.data });

        if (res.data.settings.isArchived) {
            this.context.commit('unset', pool);
        }
    }

    @Action({ rawError: true })
    async remove(pool: TPool) {
        await axios({
            method: 'DELETE',
            url: '/pools/' + pool._id,
            headers: { 'X-PoolId': pool._id },
        });

        this.context.commit('unset', pool);
    }

    @Action({ rawError: true })
    async topup({ erc20, amount, poolId }: { erc20: TERC20; amount: number; poolId: string }) {
        await axios({
            method: 'POST',
            url: '/pools/' + poolId + '/topup',
            data: { erc20Id: erc20._id, amount },
            headers: { 'X-PoolId': poolId },
        });
    }

    @Action({ rawError: true })
    async inviteCollaborator({ pool, email }: { pool: TPool; email: string }) {
        const { data } = await axios({
            method: 'POST',
            url: '/pools/' + pool._id + '/collaborators',
            data: { email },
            headers: { 'X-PoolId': pool._id },
        });

        const index = pool.collaborators.findIndex((c) => c.email === email);
        index > -1 ? (pool.collaborators[index] = data) : pool.collaborators.push(data);
        this.context.commit('set', pool);
    }

    @Action({ rawError: true })
    async removeCollaborator({ pool, uuid }: { pool: TPool; uuid: string }) {
        await axios({
            method: 'DELETE',
            url: '/pools/' + pool._id + '/collaborators/' + uuid,
            headers: { 'X-PoolId': pool._id },
        });

        const index = pool.collaborators.findIndex((c) => c.uuid === uuid);
        pool.collaborators.splice(index, 1);
        this.context.commit('set', pool);
    }

    @Action({ rawError: true })
    async updateCollaborator({ poolId, uuid }: { poolId: string; uuid: string }) {
        await axios({
            method: 'PATCH',
            url: '/pools/' + poolId + '/collaborators/' + uuid,
            headers: { 'X-PoolId': poolId },
        });
    }
}

export default PoolModule;
