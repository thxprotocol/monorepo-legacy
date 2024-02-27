import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { RewardVariant, type TPool } from '@thxnetwork/types/index';
import { type TRewardNFT } from '@thxnetwork/types/index';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';

export type RewardByPage = {
    [page: number]: TRewardNFT[];
};

export type TERC721RewardState = {
    [poolId: string]: {
        [id: string]: TRewardNFT;
    };
};

export type RewardListProps = {
    pool: TPool;
    page: number;
    limit: number;
};

type TRewardNFTInputData = TRewardNFT & {
    file?: any;
};

@Module({ namespaced: true })
class RewardNFTModule extends VuexModule {
    _all: TERC721RewardState = {};
    _totals: { [poolId: string]: number } = {};

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TRewardNFT & { _id: string }; pool: TPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        reward.variant = RewardVariant.NFT;
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TRewardNFT) {
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

        data.results.forEach((reward: TRewardNFT) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: TPool; payload: TRewardNFTInputData }) {
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
    async update({ pool, reward, payload }: { pool: TPool; reward: TRewardNFT; payload: TRewardNFTInputData }) {
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
    async delete(reward: TRewardNFT) {
        await axios({
            method: 'DELETE',
            url: `/erc721-perks/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }
}

export default RewardNFTModule;
