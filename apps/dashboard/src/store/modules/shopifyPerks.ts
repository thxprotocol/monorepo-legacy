import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from './pools';
import { RewardConditionPlatform, type TShopifyPerk } from '@thxnetwork/types/index';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/mixpanel';

export type RewardByPage = {
    [page: number]: TShopifyPerk[];
};

export type TShopifyPerkState = {
    [poolId: string]: {
        [id: string]: TShopifyPerk;
    };
};

export type RewardListProps = {
    pool: IPool;
    page: number;
    limit: number;
};

type TShopifyPerkInputData = TShopifyPerk & {
    file?: any;
};

export type TShopifyPriceRule = {
    id: string;
    title: string;
    description?: string;
};

export type TShopifyPriceRules = { [shop: string]: TShopifyPriceRule[] };

@Module({ namespaced: true })
class ShopifyPerkModule extends VuexModule {
    _all: TShopifyPerkState = {};
    _totals: { [poolId: string]: number } = {};
    _priceRules: TShopifyPriceRules = {};

    get priceRules() {
        return this._priceRules;
    }

    get all() {
        return this._all;
    }

    get totals() {
        return this._totals;
    }

    @Mutation
    set({ pool, reward }: { reward: TShopifyPerk & { _id: string }; pool: IPool }) {
        if (!this._all[pool._id]) Vue.set(this._all, pool._id, {});
        if (typeof reward.platform === 'undefined') reward.platform = RewardConditionPlatform.None; // Temp fix for corrupt data
        Vue.set(this._all[pool._id], reward._id, reward);
    }

    @Mutation
    unset(reward: TShopifyPerk) {
        Vue.delete(this._all[reward.poolId], reward._id as string);
    }

    @Mutation
    setTotal({ pool, total }: { pool: IPool; total: number }) {
        Vue.set(this._totals, pool._id, total);
    }

    @Mutation
    setPriceRule({ shop, priceRule }: { shop: string; priceRule: TShopifyPriceRule }) {
        if (!this._priceRules[shop]) Vue.set(this._priceRules, shop, {});
        Vue.set(this._priceRules[shop], priceRule.id, priceRule);
    }

    @Action({ rawError: true })
    async list({ pool, page, limit }: RewardListProps) {
        const { data } = await axios({
            method: 'GET',
            url: '/shopify-perks',
            headers: { 'X-PoolId': pool._id },
            params: {
                page: String(page),
                limit: String(limit),
            },
        });

        this.context.commit('setTotal', { pool, total: data.total });

        data.results.forEach((reward: TShopifyPerk) => {
            reward.page = page;
            this.context.commit('set', { pool, reward });
        });
    }

    @Action({ rawError: true })
    async create({ pool, payload }: { pool: IPool; payload: TShopifyPerkInputData }) {
        const formData = prepareFormDataForUpload(payload);
        const { data } = await axios({
            method: 'POST',
            url: '/shopify-perks',
            headers: { 'X-PoolId': pool._id },
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'coin perk']);

        this.context.commit('set', { pool, reward: { ...payload, ...data } });
    }

    @Action({ rawError: true })
    async update({ pool, reward, payload }: { pool: IPool; reward: TShopifyPerk; payload: TShopifyPerkInputData }) {
        const formData = prepareFormDataForUpload(payload);
        const { data } = await axios({
            method: 'PATCH',
            url: `/shopify-perks/${reward._id}`,
            headers: { 'X-PoolId': pool._id },
            data: formData,
        });

        this.context.commit('set', {
            pool: pool,
            reward: { ...reward, ...data },
        });
    }

    @Action({ rawError: true })
    async delete(reward: TShopifyPerk) {
        await axios({
            method: 'DELETE',
            url: `/shopify-perks/${reward._id}`,
            headers: { 'X-PoolId': reward.poolId },
        });
        this.context.commit('unset', reward);
    }

    @Action({ rawError: true })
    async listPriceRules({ pool, shop }: { pool: IPool; shop: string }) {
        const { data } = await axios({
            method: 'GET',
            url: '/shopify-perks/price-rules',
            headers: { 'X-PoolId': pool._id },
        });

        data.forEach((priceRule: TShopifyPriceRule) => {
            this.context.commit('setPriceRule', { shop, priceRule });
        });
    }
}

export default ShopifyPerkModule;
