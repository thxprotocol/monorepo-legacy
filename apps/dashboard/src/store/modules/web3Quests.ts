import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { track } from '@thxnetwork/mixpanel';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { QuestVariant } from '@thxnetwork/types/enums';
import type { TPool, TBaseReward, TWeb3Quest } from '@thxnetwork/types/interfaces';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

export type TWeb3QuestState = {
    [poolId: string]: {
        [id: string]: TWeb3Quest;
    };
};

@Module({ namespaced: true })
class Web3QuestModule extends VuexModule {
    _all: TWeb3QuestState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    unset(quest: TWeb3Quest) {
        Vue.delete(this._all[quest.poolId], quest._id as string);
    }

    @Mutation
    set(quest: TWeb3Quest) {
        if (!this._all[quest.poolId]) Vue.set(this._all, quest.poolId, {});
        quest.variant = QuestVariant.Web3;
        Vue.set(this._all[quest.poolId], String(quest._id), quest);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        this._totals[pool._id] = total;
    }

    @Action({ rawError: true })
    async list({ page, pool, limit }: { page: number; pool: TPool; limit: number }) {
        const { data } = await axios({
            method: 'GET',
            url: '/web3-quests',
            headers: { 'X-PoolId': pool._id },
            params: { limit, page },
        });
        this.context.commit('setTotal', { pool, total: data.total });
        data.results.forEach((quest: TWeb3Quest) => {
            quest.page = page;
            quest.update = (payload: TBaseReward) => this.context.dispatch('update', payload);
            this.context.commit('set', quest);
        });
    }

    @Action({ rawError: true })
    async create(quest: TWeb3Quest) {
        const { data } = await axios({
            method: 'POST',
            url: '/web3-quests',
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });
        const profile = this.context.rootGetters['account/profile'];

        track('UserCreates', [profile.sub, 'conditional quest']);

        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async update(quest: TWeb3Quest) {
        console.log(quest);
        const { data } = await axios({
            method: 'PATCH',
            url: `/web3-quests/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
            data: prepareFormDataForUpload(quest),
        });

        this.context.commit('set', { ...quest, ...data });
    }

    @Action({ rawError: true })
    async delete(quest: TWeb3Quest) {
        await axios({
            method: 'DELETE',
            url: `/web3-quests/${quest._id}`,
            headers: { 'X-PoolId': quest.poolId },
        });
        this.context.commit('pools/unsetQuest', quest, { root: true });
    }
}

export default Web3QuestModule;
