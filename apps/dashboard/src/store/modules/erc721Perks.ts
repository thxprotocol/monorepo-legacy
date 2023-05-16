import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { type TPool } from '@thxnetwork/types/index';
import { RewardConditionPlatform, type TERC721Perk } from '@thxnetwork/types/index';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';

export type RewardByPage = {
    [page: number]: TERC721Perk[];
};

export type TRewardState = {
    [poolId: string]: {
        [id: string]: TERC721Perk;
    };
};

export type RewardListProps = {
    pool: TPool;
    page: number;
    limit: number;
};

type TERC721PerkInputData = TERC721Perk & {
    file?: any;
};

@Module({ namespaced: true })
class ERC721PerkModule extends VuexModule {
    _all: TRewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TERC721Perk & { _id: string }; pool: TPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TERC721Perk) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: TPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }: RewardListProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721-perks',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TERC721Perk) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: TPool; payload: TERC721PerkInputData }) {
        const formData = prepareFormDataForUpload(payload);
        const r = await axios({
            method: 'POST',
            url: '/erc721-perks',
            headers: { 'X-PoolId': pool._id },
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'nft perk']);

        r.data.forEach((data: any) => {
            this.context.commit('set', { pool, reward: { ...payload, ...data } });
        });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: TPool; reward: TERC721Perk; payload: TERC721PerkInputData }) {
        const formData = prepareFormDataForUpload(payload);
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc721-perks/${reward._id}`,
            headers: { 'X-PoolId': pool._id },
            data: formData,
        });
        this.context.commit('set', {
            pool,
            reward: { ...reward, ...data, page: reward.page },
        });
    }

    @Action({ rawError: true })
    async delete(reward: TERC721Perk) {
        await axios({
            method: 'DELETE',
            url: `/erc721-perks/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default ERC721PerkModule;
