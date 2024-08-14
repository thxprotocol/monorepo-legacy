import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { track } from '@thxnetwork/common/mixpanel';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { AccountPlanType, ChainId } from '@thxnetwork/common/enums';
import * as html from 'html-entities';
import { QuestEntryStatus } from '@thxnetwork/common/enums/QuestEntryStatus';

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

export type TRewardState = {
    [poolId: string]: {
        total: number;
        limit: number;
        page: number;
        results: TReward[];
    };
};

export type TRewardPaymentState = {
    [poolId: string]: {
        [rewardId: string]: TPaginationResult & { results: TRewardPayment[] };
    };
};

export type TQuestState = {
    [poolId: string]: {
        total: number;
        limit: number;
        page: number;
        results: TQuest[];
    };
};

export type TQuestEntryMeta = {
    reachTotal: number;
};

export type TQuestEntryState = {
    [poolId: string]: {
        [questId: string]: TPaginationResult & { results: TQuestEntry[]; meta?: TQuestEntryMeta };
    };
};

export type TGuildState = {
    [poolId: string]: {
        [guildId: string]: TDiscordGuild;
    };
};

export type TCouponCodeState = {
    [poolId: string]: {
        [rewardId: string]: TPaginationResult & { results: TCouponCode[] };
    };
};

export type TParticipantState = {
    [poolId: string]: TPaginationResult & { results: TParticipant[] };
};

export type TPaymentState = {
    [poolId: string]: TPayment[];
};

export type TTwitterQueryState = {
    [poolId: string]: TTwitterQuery[];
};

export type TWalletState = {
    [poolId: string]: TWallet[];
};

@Module({ namespaced: true })
class PoolModule extends VuexModule {
    _all: IPools = {};
    _quests: TQuestState = {};
    _entries: TQuestEntryState = {};
    _rewards: TQuestState = {};
    _rewardPayments: TQuestState = {};
    _guilds: TGuildState = {};
    _wallets: TWalletState = {};
    _participants: TParticipantState = {};
    _couponCodes: TCouponCodeState = {};
    _analytics: IPoolAnalytics = {};
    _analyticsMetrics: IPoolAnalyticsLeaderBoard = {};
    _payments: TPaymentState = {};
    _twitterQueries: TTwitterQueryState = {};

    get twitterQueries() {
        return this._twitterQueries;
    }

    get all() {
        return this._all;
    }

    get guilds() {
        return this._guilds;
    }

    get rewards() {
        return this._rewards;
    }

    get payments() {
        return this._payments;
    }

    get rewardPayments() {
        return this._rewardPayments;
    }

    get quests() {
        return this._quests;
    }

    get entries() {
        return this._entries;
    }

    get participants() {
        return this._participants;
    }

    get couponCodes() {
        return this._couponCodes;
    }

    get analytics() {
        return this._analytics;
    }

    get analyticsMetrics() {
        return this._analyticsMetrics;
    }

    get wallets() {
        return this._wallets;
    }

    @Mutation
    set(pool: TPool) {
        pool.settings.title = html.decode(pool.settings.title);
        pool.settings.description = html.decode(pool.settings.description);
        Vue.set(this._all, pool._id, pool);
    }

    @Mutation
    setAnalytics(data: IPoolAnalytic) {
        Vue.set(this._analytics, data._id, data);
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
    setRewards({ poolId, result }: { poolId: string; result: { results: TReward[] } & TPaginationResult }) {
        Vue.set(this._rewards, poolId, result);
    }

    @Mutation
    setQuests({ poolId, result }: { poolId: string; result: { results: TQuest[] } & TPaginationResult }) {
        Vue.set(this._quests, poolId, result);
    }

    @Mutation
    setPayments({ poolId, result }: { poolId: string; result: { results: TPayment[] } & TPaginationResult }) {
        Vue.set(this._payments, poolId, result);
    }

    @Mutation
    setQuestEntries({
        poolId,
        questId,
        result,
    }: {
        poolId: string;
        questId: string;
        result: { results: TQuestEntry[] } & TPaginationResult;
    }) {
        if (!this._entries[poolId]) Vue.set(this._entries, poolId, {});
        Vue.set(this._entries[poolId], questId, result);
    }

    @Mutation
    updateQuestEntries({ poolId, questId, entries }: { poolId: string; questId: string; entries: TQuestEntry[] }) {
        this._entries[poolId][questId].results = this._entries[poolId][questId].results.map((entry) => ({
            ...entry,
            ...entries.find((e) => e._id === entry._id),
        }));
    }

    @Mutation
    setRewardPayments({
        poolId,
        rewardId,
        result,
    }: {
        poolId: string;
        rewardId: string;
        result: { results: TQuestEntry[] } & TPaginationResult;
    }) {
        if (!this._rewardPayments[poolId]) Vue.set(this._rewardPayments, poolId, {});
        Vue.set(this._rewardPayments[poolId], rewardId, result);
    }
    @Mutation
    unsetQuestTwitterQuery(query: TTwitterQuery) {
        Vue.delete(this._twitterQueries[query.poolId], query._id);
    }

    @Mutation
    setQuestTwitterQuery(query: TTwitterQuery) {
        if (!this._twitterQueries[query.poolId]) Vue.set(this._twitterQueries, query.poolId, {});
        Vue.set(this._twitterQueries[query.poolId], query._id, query);
    }

    @Mutation
    setReward(reward: TReward) {
        if (!this._rewards[reward.poolId]) return;

        const rewards = this._rewards[reward.poolId].results;
        const index = rewards.findIndex((q) => q._id === reward._id);

        Vue.set(this._rewards[reward.poolId].results, index, reward);
    }

    @Mutation
    unsetReward(reward: TReward) {
        const rewards = this._rewards[reward.poolId].results;
        const index = rewards.findIndex((q) => q._id === reward._id);
        Vue.delete(this._rewards[reward.poolId].results, index);
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
    setGuild(guild: TDiscordGuild) {
        if (!this._guilds[guild.poolId]) Vue.set(this._guilds, guild.poolId, {});
        Vue.set(this._guilds[guild.poolId], guild.guildId, guild);
    }

    @Mutation
    unsetGuild(guild: TDiscordGuild) {
        Vue.delete(this._guilds[guild.poolId], guild.guildId);
    }

    @Mutation
    setParticipants(data: { poolId: string; result: { results: TParticipant[] } & TPaginationResult }) {
        Vue.set(this._participants, data.poolId, data.result);
    }

    @Mutation
    setCouponCodes(data: {
        poolId: string;
        couponRewardId: string;
        result: { results: TCouponCode[] } & TPaginationResult;
    }) {
        if (!this._couponCodes[data.poolId]) Vue.set(this._couponCodes, data.poolId, {});
        Vue.set(this._couponCodes[data.poolId], data.couponRewardId, data.result);
    }

    @Mutation
    unsetCouponCode({ poolId, rewardId, couponCodeId }: { poolId: string; rewardId: string; couponCodeId: string }) {
        const couponCodes = this._couponCodes[poolId][rewardId].results;
        const index = couponCodes.findIndex((c) => c._id === couponCodeId);
        Vue.delete(this._couponCodes[poolId][rewardId].results, index);
    }

    @Mutation
    setParticipant(data: TParticipant) {
        const index = this._participants[data.poolId].results.findIndex((p) => p._id === data._id);
        Vue.set(this._participants[data.poolId].results, index, data);
    }
    @Mutation
    setWallets(wallets: TWallet[]) {
        Vue.set(this._wallets, wallets[0].poolId, wallets);
    }

    @Mutation
    unsetWallet({ pool, walletId }) {
        Vue.delete(this._wallets[pool._id], walletId);
    }

    @Action({ rawError: true })
    async listWallets({ pool }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/wallets`,
        });
        this.context.commit('setWallets', data);
    }

    @Action({ rawError: true })
    async removeWallet({ pool, walletId }) {
        await axios({
            method: 'DELETE',
            url: `/pools/${pool._id}/wallets/${walletId}`,
        });
        this.context.commit('unsetWallet', { pool, walletId });
    }

    @Action({ rawError: true })
    async listGuilds(pool: TPool) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/guilds`,
            headers: { 'X-PoolId': pool._id },
        });
        for (const guild of data) {
            this.context.commit('setGuild', guild);
        }
    }

    @Action({ rawError: true })
    async removeGuild(payload: TDiscordGuild) {
        this.context.commit('setGuild', { ...payload, isConnected: false });
        await axios({
            method: 'DELETE',
            url: `/pools/${payload.poolId}/guilds/${payload._id}`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
    }

    @Action({ rawError: true })
    async updateGuild(payload: TDiscordGuild) {
        await axios({
            method: 'PATCH',
            url: `/pools/${payload.poolId}/guilds/${payload._id}`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        this.context.commit('setGuild', payload);
    }

    @Action({ rawError: true })
    async createGuild(payload: TDiscordGuild) {
        const { data } = await axios({
            method: 'POST',
            url: `/pools/${payload.poolId}/guilds`,
            headers: { 'X-PoolId': payload.poolId },
            data: payload,
        });
        this.context.commit('setGuild', { ...payload, ...data, isConnected: true });
    }

    @Action({ rawError: true })
    async createWallet({ pool, chainId }: { pool: TPool; chainId: ChainId }) {
        await axios({
            method: 'POST',
            url: `/pools/${pool._id}/wallets`,
            data: {
                chainId,
            },
        });

        await this.context.dispatch('listWallets', { pool });
    }

    @Action({ rawError: true })
    async removeTwitterQuery({ query }: { query: TTwitterQuery }) {
        await axios({
            method: 'DELETE',
            url: `/pools/${query.poolId}/integrations/twitter/queries/${query._id}`,
        });
        this.context.commit('unsetQuestTwitterQuery', query);
    }

    @Action({ rawError: true })
    async createTwitterQuery({ pool, data }: { pool: TPool; data: { operators: { [operatorKey: string]: string } } }) {
        await axios({
            method: 'POST',
            url: `/pools/${pool._id}/integrations/twitter/queries`,
            data,
        });
    }

    @Action({ rawError: true })
    async listTwitterQueries({ pool }: { pool: TPool }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/integrations/twitter/queries`,
        });

        for (const query of data) {
            this.context.commit('setQuestTwitterQuery', query);
        }
    }

    @Action({ rawError: true })
    async createPayment({
        pool,
        amountInWei,
        planType,
    }: {
        pool: TPool;
        amountInWei: string;
        planType: AccountPlanType;
    }) {
        await axios({
            method: 'POST',
            url: `/pools/${pool._id}/payments`,
            data: { amountInWei, planType },
        });
    }

    @Action({ rawError: true })
    async createQuest(payload: TQuest) {
        await axios({
            method: 'POST',
            url: `/pools/${payload.poolId}/quests/${payload.variant}`,
            data: prepareFormDataForUpload(payload),
        });
    }

    @Action({ rawError: true })
    async createReward(payload: TReward) {
        await axios({
            method: 'POST',
            url: `/pools/${payload.poolId}/rewards/${payload.variant}`,
            data: prepareFormDataForUpload(payload),
        });
    }

    @Action({ rawError: true })
    async listRewards({ pool, page, limit, isPublished }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/rewards`,
            params: { page, limit, isPublished },
        });

        data.results = data.results.map((q) => {
            q.delete = (reward) => this.context.dispatch('removeReward', reward);
            q.update = (reward) => this.context.dispatch('updateReward', reward);
            return q;
        });

        this.context.commit('setRewards', { poolId: pool._id, result: data });
    }

    @Action({ rawError: true })
    async listQuests({ pool, page, limit, isPublished }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/quests`,
            params: { page, limit, isPublished },
        });

        data.results = data.results.map((q: TBaseQuest) => {
            q.title = html.decode(q.title);
            q.description = html.decode(q.description);
            q.expiryDate = q.expiryDate ? new Date(q.expiryDate) : '';
            q.infoLinks = q.infoLinks.map(({ url, label }) => ({
                label: html.decode(label),
                url,
            }));
            return q;
        });

        this.context.commit('setQuests', { poolId: pool._id, result: data });
    }

    @Action({ rawError: true })
    async sortQuests({ pool, quests, page, limit, isPublished }) {
        await axios({
            method: 'POST',
            url: `/pools/${pool._id}/quests`,
            data: { quests },
        });
        await this.context.dispatch('listQuests', { pool, page, limit, isPublished });
    }

    @Action({ rawError: true })
    async listQuestsAll(pool: TPool) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/quests`,
        });

        return data.results;
    }

    @Action({ rawError: true })
    async updateQuest(payload: TQuest) {
        const { data: q } = await axios({
            method: 'PATCH',
            url: `/pools/${payload.poolId}/quests/${payload.variant}/${payload._id}`,
            data: prepareFormDataForUpload(payload),
        });
        this.context.commit('setQuest', q);
    }

    @Action({ rawError: true })
    async updateEntries({
        quest,
        entries,
    }: {
        quest: TQuest;
        entries: { entryId: string; state: QuestEntryStatus }[];
    }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/pools/${quest.poolId}/quests/${quest.variant}/${quest._id}/entries`,
            data: {
                entries: JSON.stringify(entries),
            },
        });
        this.context.commit('updateQuestEntries', {
            poolId: quest.poolId,
            questId: quest._id,
            entries: data,
        });
    }

    @Action({ rawError: true })
    async updateReward(payload: TReward) {
        await axios({
            method: 'PATCH',
            url: `/pools/${payload.poolId}/rewards/${payload.variant}/${payload._id}`,
            data: prepareFormDataForUpload(payload),
        });
        this.context.commit('setReward', payload);
    }

    @Action({ rawError: true })
    async removeQuest(payload: TQuest) {
        await axios({
            method: 'DELETE',
            url: `/pools/${payload.poolId}/quests/${payload.variant}/${payload._id}`,
            data: payload,
        });
        this.context.commit('unsetQuest', payload);
    }

    @Action({ rawError: true })
    async removeReward(payload: TReward) {
        await axios({
            method: 'DELETE',
            url: `/pools/${payload.poolId}/rewards/${payload.variant}/${payload._id}`,
        });
        this.context.commit('unsetReward', payload);
    }

    @Action({ rawError: true })
    async listEntries(payload: { quest: TQuest; limit: number; page: number }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${payload.quest.poolId}/quests/${payload.quest.variant}/${payload.quest._id}/entries`,
            headers: { 'X-PoolId': payload.quest.poolId },
            params: {
                page: payload.page,
                limit: payload.limit,
            },
        });
        this.context.commit('setQuestEntries', {
            poolId: payload.quest.poolId,
            questId: payload.quest._id,
            result: data,
        });
    }

    @Action({ rawError: true })
    async listPayments(payload: { reward: TReward; limit: number; page: number }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${payload.reward.poolId}/payments`,
            params: {
                page: payload.page,
                limit: payload.limit,
            },
        });
        this.context.commit('setPayments', {
            poolId: payload.reward.poolId,
            result: data,
        });
    }

    @Action({ rawError: true })
    async listRewardPayments(payload: { reward: TReward; limit: number; page: number; query: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${payload.reward.poolId}/rewards/${payload.reward.variant}/${payload.reward._id}/payments`,
            headers: { 'X-PoolId': payload.reward.poolId },
            params: {
                page: payload.page,
                limit: payload.limit,
                query: payload.query,
            },
        });
        this.context.commit('setRewardPayments', {
            poolId: payload.reward.poolId,
            rewardId: payload.reward._id,
            result: data,
        });
    }

    @Action({ rawError: true })
    async list() {
        this.context.commit('clear');

        const { data } = await axios({
            method: 'GET',
            url: '/pools',
        });

        for (const pool of data) {
            // Skip pools that are already in store
            if (this.context.rootGetters['pools/all'][pool._id]) continue;
            this.context.commit('set', pool);
        }
    }

    @Action({ rawError: true })
    async read(poolId: string) {
        const r = await axios({
            method: 'get',
            url: '/pools/' + poolId,
        });
        this.context.commit('set', r.data);
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
    async readAnalyticsMetrics(payload: { poolId: string; startDate: Date; endDate: Date }) {
        const r = await axios({
            method: 'get',
            url: `/pools/${payload.poolId}/analytics/metrics`,
            params: { startDate: payload.startDate, endDate: payload.endDate },
        });
        this.context.commit('setAnalyticsMetrics', { _id: payload.poolId, ...r.data });
        return r.data;
    }

    @Action({ rawError: true })
    async listCouponCodes({
        pool,
        reward,
        page,
        limit,
        query,
    }: {
        pool: TPool;
        reward: TRewardCoupon;
        page: string;
        limit: string;
        query: string;
    }) {
        const { data } = await axios({
            method: 'GET',
            url: `/coupons`,
            headers: { 'X-PoolId': pool._id },
            params: {
                poolId: pool._id,
                couponRewardId: reward._id,
                page,
                limit,
                query,
            },
        });
        this.context.commit('setCouponCodes', { poolId: pool._id, couponRewardId: reward._id, result: data });
    }

    @Action({ rawError: true })
    async deleteCouponCode({ reward, couponCodeId }: { pool: TPool; reward: TRewardCoupon; couponCodeId: string }) {
        await axios({
            method: 'DELETE',
            url: `/coupons/${couponCodeId}`,
        });

        this.context.commit('unsetCouponCode', { poolId: reward.poolId, rewardId: reward._id, couponCodeId });
    }

    @Action({ rawError: true })
    async listParticipants({
        pool,
        page,
        limit,
        sort,
        query,
    }: {
        pool: TPool;
        page: string;
        limit: string;
        sort: string;
        query: string;
    }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/participants`,
            headers: { 'X-PoolId': pool._id },
            params: {
                page,
                limit,
                sort,
                query,
            },
        });
        this.context.commit('setParticipants', { poolId: pool._id, result: data });
    }

    @Action({ rawError: true })
    async resetParticipants(pool: TPool) {
        await axios({
            method: 'POST',
            url: `/pools/${pool._id}/participants/balance/reset`,
        });
    }

    @Action({ rawError: true })
    async exportParticipants(pool: TPool) {
        const response = await axios({
            method: 'get',
            url: `/pools/${pool._id}/participants/export`,
            responseType: 'blob',
        });
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));

        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `participants${pool._id}.csv`); // Set file name

        // Append the link to the body (required for Firefox)
        document.body.appendChild(link);

        // Simulate a click to trigger download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
    }

    @Action({ rawError: true })
    async getLeaderboard({
        pool,
        limit,
        startDate,
        endDate,
    }: {
        pool: TPool;
        limit: string;
        startDate: Date;
        endDate: Date;
    }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/analytics/leaderboard`,
            headers: { 'X-PoolId': pool._id },
            params: {
                limit,
                startDate,
                endDate,
            },
        });

        return data;
    }

    @Action({ rawError: true })
    async updateParticipant(data: TParticipant) {
        await axios({
            method: 'PATCH',
            url: `/pools/${data.poolId}/participants/${String(data._id)}`,
            headers: { 'X-PoolId': data.poolId },
            data,
        });
        this.context.commit('setParticipant', data);
    }

    @Action({ rawError: true })
    async duplicate(pool: TPool) {
        const { data } = await axios({
            method: 'POST',
            url: `/pools/${pool._id}/duplicate`,
        });

        this.context.commit('set', data);
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

        return r.data;
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
