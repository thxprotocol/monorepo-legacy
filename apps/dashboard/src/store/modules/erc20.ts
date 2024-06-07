import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { IERC20s, TERC20, TERC20AllowanceState, TERC20BalanceState } from '@thxnetwork/dashboard/types/erc20';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';
import { track } from '@thxnetwork/common/mixpanel';
import { ChainId } from '@thxnetwork/common/enums';

@Module({ namespaced: true })
class ERC20Module extends VuexModule {
    _all: IERC20s = {};
    _balances: TERC20BalanceState = {};
    _allowances: TERC20AllowanceState = {};

    get all() {
        return this._all;
    }

    get balances() {
        return this._balances;
    }

    get allowances() {
        return this._allowances;
    }

    @Mutation
    set(erc20: TERC20) {
        if (!erc20.logoImgUrl || !erc20.logoImgUrl.length) {
            erc20.logoImgUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${erc20.address}`;
        }
        Vue.set(this._all, erc20._id, erc20);
    }

    @Mutation
    unset(erc20: TERC20) {
        Vue.delete(this._all, erc20._id);
    }

    @Mutation
    setBalance(data: { tokenAddress: string; address: string; balance: string }) {
        if (!this._balances[data.tokenAddress]) Vue.set(this._balances, data.tokenAddress, {});
        Vue.set(this._balances[data.tokenAddress], data.address, data.balance);
    }

    @Mutation
    setAllowance(data: { tokenAddress: string; poolAddress: string; spender: string; allowance: string }) {
        if (!this._allowances[data.tokenAddress]) Vue.set(this._allowances, data.tokenAddress, {});
        if (!this._allowances[data.tokenAddress][data.poolAddress]) {
            Vue.set(this._allowances[data.tokenAddress], data.poolAddress, {});
        }
        Vue.set(this._allowances[data.tokenAddress][data.poolAddress], data.spender, data.allowance);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        this.context.commit('clear');

        const { data } = await axios({
            method: 'GET',
            url: '/erc20',
            params,
        });

        for (const erc20 of data) {
            this.context.commit('set', erc20);
        }
    }

    @Action({ rawError: true })
    async allowance({ pool, tokenAddress, spender }: { pool: TPool; tokenAddress: string; spender: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/erc20/allowance`,
            params: {
                tokenAddress,
                spender,
            },
        });
        this.context.commit('setAllowance', {
            tokenAddress,
            poolAddress: pool.safeAddress,
            spender,
            allowance: data.allowanceInWei,
        });
    }

    @Action({ rawError: true })
    async approve({
        pool,
        tokenAddress,
        spender,
        amountInWei,
    }: {
        pool: TPool;
        tokenAddress: string;
        spender: string;
        amountInWei: string;
    }) {
        const { data } = await axios({
            method: 'POST',
            url: `/pools/${pool._id}/erc20/allowance`,
            data: {
                tokenAddress,
                spender,
                amountInWei,
            },
        });
        this.context.commit('setAllowance', {
            tokenAddress,
            poolAddress: pool.safeAddress,
            spender,
            allowance: data.allowanceInWei,
        });
    }

    @Action({ rawError: true })
    async balanceOf({ pool, tokenAddress }: { pool: TPool; tokenAddress: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/erc20/balance`,
            params: {
                tokenAddress,
            },
        });
        this.context.commit('setBalance', { tokenAddress, address: pool.safeAddress, balance: data.balanceInWei });
    }

    @Action({ rawError: true })
    async read(erc20: TERC20) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc20/' + erc20._id,
        });

        this.context.commit('set', data);
    }

    @Action({ rawError: true })
    async create(payload: any) {
        const formData = prepareFormDataForUpload(payload);

        const { data } = await axios({
            method: 'POST',
            url: '/erc20',
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'coin']);

        await this.context.dispatch('read', data);
    }

    @Action({ rawError: true })
    async import(payload: any) {
        const { data } = await axios({
            method: 'POST',
            url: '/erc20/token',
            data: payload,
        });

        await this.context.dispatch('read', data);
    }

    @Action({ rawError: true })
    async remove(erc20: TERC20) {
        await axios({
            method: 'DELETE',
            url: '/erc20/' + erc20._id,
        });

        this.context.commit('unset', erc20);
    }

    @Action({ rawError: true })
    async update({ erc20, data }: { erc20: TERC20; data: { archived: boolean } }) {
        await axios({
            method: 'PATCH',
            url: `/erc20/${erc20._id}`,
            data,
        });

        this.context.commit('set', { ...erc20, ...data });
    }

    @Action({ rawError: true })
    async preview(params: { chainId: ChainId; address: string }) {
        const { data } = await axios({
            method: 'get',
            url: '/erc20/preview',
            params,
        });
        return data;
    }
}

export default ERC20Module;
