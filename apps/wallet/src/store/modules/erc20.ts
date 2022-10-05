import Vue from 'vue';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { send } from '@thxnetwork/wallet/utils/network';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { fromWei, toWei, toChecksumAddress } from 'web3-utils';
import axios from 'axios';
import Web3 from 'web3';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';

export interface ERC20 {
    _id: string;
    erc20Id: string;
    address: string;
    contract: Contract;
    name: string;
    symbol: string;
    blockExplorerUrl?: string;
    balance: string;
    totalSupply: string;
    logoURI: string;
}

export interface IERC20s {
    [id: string]: ERC20;
}

@Module({ namespaced: true })
class ERC20Module extends VuexModule {
    _all: IERC20s = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(erc20: ERC20) {
        Vue.set(this._all, erc20._id, erc20);
    }

    @Mutation
    setBalance(payload: { erc20: ERC20; balance: string }) {
        Vue.set(this._all[payload.erc20._id], 'balance', payload.balance);
    }

    @Action({ rawError: true })
    async list() {
        const { data } = await axios({
            method: 'GET',
            url: '/erc20/token',
        });
        data.forEach((_id: string) => {
            this.context.commit('set', { _id });
        });
    }

    @Action({ rawError: true })
    async getContract(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc20/' + id,
        });
        const web3 = this.context.rootGetters['network/all'][data.chainId];
        const from = this.context.rootGetters['account/profile'].address;
        const contract = new web3.eth.Contract(ERC20Abi as any, data.address, { from });
        const totalSupply = Number(fromWei(await contract.methods.totalSupply().call()));
        const erc20 = {
            ...data,
            contract,
            totalSupply,
            balance: 0,
            blockExplorerUrl: `${chainInfo[data.chainId].blockExplorer}/address/${data.address}`,
            logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
        };

        this.context.commit('set', erc20);
        this.context.dispatch('balanceOf', erc20);
    }

    @Action({ rawError: true })
    async get(id: string) {
        try {
            const { data } = await axios({
                method: 'GET',
                url: '/erc20/token/' + id,
            });

            const web3 = this.context.rootGetters['network/all'][data.chainId];
            const from = this.context.rootGetters['account/profile'].address;
            const contract = new web3.eth.Contract(ERC20Abi as any, data.address, { from });
            const totalSupply = Number(fromWei(await contract.methods.totalSupply().call()));
            const erc20 = {
                ...data,
                contract,
                totalSupply,
                balance: 0,
                blockExplorerUrl: `${chainInfo[data.chainId].blockExplorer}/address/${data.address}`,
                logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
            };

            this.context.commit('set', erc20);
            this.context.dispatch('balanceOf', erc20);
        } catch (error) {
            return { error };
        }
    }

    @Action({ rawError: true })
    async balanceOf(erc20: ERC20) {
        const profile = this.context.rootGetters['account/profile'];
        const wei = await erc20.contract.methods.balanceOf(profile.address).call();
        const balance = fromWei(wei);
        this.context.commit('setBalance', { erc20, balance });
    }

    @Action({ rawError: true })
    async allowance({ token, owner, spender }: { token: ERC20; owner: string; spender: string }) {
        const wei = await token.contract.methods.allowance(owner, spender).call({ from: owner });
        return { allowance: fromWei(wei, 'ether') };
    }

    @Action({ rawError: true })
    async approve({
        token,
        chainId,
        to,
        poolId,
        amount,
    }: {
        token: ERC20;
        chainId: ChainId;
        to: string;
        poolId: string;
        amount: string;
    }) {
        const web3: Web3 = this.context.rootGetters['network/all'][chainId];
        const profile = this.context.rootGetters['account/profile'];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const balance = Number(fromWei(await web3.eth.getBalance(profile.address)));

        if (balance === 0) {
            await axios({
                method: 'POST',
                url: `/deposits/approve`,
                headers: {
                    'X-PoolId': poolId,
                },
                data: {
                    amount,
                },
            });
        }

        const tx = await send(web3, token.address, token.contract.methods.approve(to, amount), privateKey);

        return { tx };
    }

    @Action({ rawError: true })
    async transfer({ token, chainId, to, amount }: { token: ERC20; chainId: ChainId; to: string; amount: string }) {
        const wei = toWei(amount);
        const web3 = this.context.rootGetters['network/all'][chainId];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const tx = await send(
            web3,
            token.address,
            token.contract.methods.transfer(toChecksumAddress(to), wei),
            privateKey,
        );

        return { tx };
    }
}

export default ERC20Module;
