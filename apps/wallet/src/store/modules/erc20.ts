import Vue from 'vue';
import axios from 'axios';
import { default as ERC20Abi } from '@thxnetwork/contracts/exports/abis/LimitedSupplyToken.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { fromWei, toWei, toChecksumAddress } from 'web3-utils';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

export type TERC20 = {
    _id: string;
    address: string;
    name: string;
    symbol: string;
    totalSupply: string;
    logoImgUrl: string;
    chainId: ChainId;
    contract: Contract;
    blockExplorerUrl?: string;
};
export interface TERC20Token {
    _id: string;
    erc20Id: string;
    balanceInWei: string;
    balance: string;
    balancePending: string;
    walletBalance: string;
    pendingWithdrawals: { amount: number }[];
    erc20: TERC20;
}

export interface IERC20s {
    [erc20Id: string]: TERC20;
}

@Module({ namespaced: true })
class ERC20Module extends VuexModule {
    contracts: IERC20s = {};

    @Mutation
    set(token: TERC20Token) {
        Vue.set(this.contracts, token.erc20._id, token);
    }

    @Mutation
    setBalance({ erc20, balance }: { erc20: TERC20; balance: string }) {
        if (!this.contracts[erc20._id]) Vue.set(this.contracts, erc20._id, {});
        Vue.set(this.contracts[erc20._id], 'balance', balance);
    }

    @Action({ rawError: true })
    async list() {
        const data = await thxClient.erc20.list({ chainId: this.context.rootGetters['network/chainId'] });

        data.forEach((token: TERC20Token) => {
            const web3 = this.context.rootState.network.web3;
            const from = this.context.rootGetters['account/profile'].address;
            token.erc20.contract = new web3.eth.Contract(ERC20Abi as unknown, token.erc20.address, { from });
            token.erc20.blockExplorerUrl = `${chainInfo[token.erc20.chainId].blockExplorer}/address/${
                token.erc20.address
            }`;

            this.context.commit('set', token);
        });
    }

    @Action({ rawError: true })
    async get(id: string) {
        try {
            const token = await thxClient.erc20.get(id);
            const web3 = this.context.rootState.network.web3;
            const from = this.context.rootGetters['account/profile'].address;
            token.erc20.contract = new web3.eth.Contract(ERC20Abi as unknown, token.erc20.address, { from });
            token.erc20.blockExplorerUrl = `${chainInfo[token.erc20.chainId].blockExplorer}/address/${
                token.erc20.address
            }`;

            this.context.commit('set', token);
        } catch (error) {
            return { error };
        }
    }

    @Action({ rawError: true })
    async getContract(id: string) {
        const data = await thxClient.erc20.getContract(id);

        const web3 = this.context.rootState.network.web3;
        const from = this.context.rootGetters['account/profile'].address;

        data.contract = new web3.eth.Contract(ERC20Abi as unknown, data.address, {
            from,
        });
        data.blockExplorerUrl = `${chainInfo[data.chainId].blockExplorer}/address/${data.address}`;
        data.logoURI = `https://avatars.dicebear.com/api/identicon/${data.address}.svg`;

        this.context.commit('set', data);
    }

    @Action({ rawError: true })
    async balanceOf(erc20: TERC20) {
        const address = this.context.rootGetters['account/profile'].address;
        const balanceInWei = await erc20.contract.methods.balanceOf(address).call();
        const balance = fromWei(balanceInWei);
        this.context.commit('setBalance', { erc20, balance });
    }

    @Action({ rawError: true })
    async allowance({ contract, owner, spender }: { contract: Contract; owner: string; spender: string }) {
        return await contract.methods.allowance(owner, spender).call({ from: owner });
    }

    @Action({ rawError: true })
    async approve({
        contract,
        to,
        amount,
        poolId,
    }: {
        contract: Contract;
        to: string;
        amount: string;
        poolId: string;
    }) {
        const { web3, address } = this.context.rootState.network;
        const user = this.context.rootGetters['account/user'];
        const allowance = await this.context.dispatch('allowance', {
            contract,
            owner: address,
            spender: to,
        });

        // Early return if allowance is already sufficient
        if (Number(allowance) >= Number(amount)) return;

        if (user && poolId) {
            const balance = Number(fromWei(await web3.eth.getBalance(address)));
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
                // TODO Await the balance increase here
            }
        }

        await this.context.dispatch(
            'network/send',
            {
                to: contract.options.address,
                fn: contract.methods.approve(to, amount),
            },
            { root: true },
        );
    }

    @Action({ rawError: true })
    async transfer({ erc20, to, amount }: { erc20: TERC20; to: string; amount: string }) {
        const wei = toWei(amount);

        await this.context.dispatch(
            'network/send',
            {
                to: erc20.address,
                fn: erc20.contract.methods.transfer(toChecksumAddress(to), wei),
            },
            { root: true },
        );
    }
}

export default ERC20Module;
