import Vue from 'vue';
import { default as ERC721Abi } from '@thxnetwork/contracts/exports/abis/NonFungibleToken.json';
import { Contract } from 'web3-eth-contract';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { thxClient } from '@thxnetwork/wallet/utils/oidc';

export interface ERC721 {
    _id: string;
    address: string;
    contract: Contract;
    baseURL: string;
    name: string;
    description: string;
    symbol: string;
    balance: string;
    totalSupply: string;
    properties: { propType: string; name: string; description: string }[];
    logoURI: string;
    blockExplorerUrl?: string;
    chainId: ChainId;
}

export type TERC721Token = {
    _id: string;
    sub: string;
    recipient: string;
    failReason: string;
    transactions: string[];
    tokenSymbol: string;
    tokenId: number;
    tokenUri: string;
    erc721: ERC721;
    erc721Id: string;
    metadataId: string;
    metadata: TERC721Metadata;
};

export type TERC721Metadata = {
    _id: string;
    erc721: string;
    title: string;
    description: string;
    attributes: { key: string; value: any }[];
};

@Module({ namespaced: true })
class ERC721Module extends VuexModule {
    erc721s: { [_erc721Id: string]: ERC721 } = {};
    tokens: { [_tokenId: string]: TERC721Token } = {};
    metadata: { [_tokenId: string]: TERC721Metadata } = {};

    @Mutation
    set(erc20: ERC721) {
        Vue.set(this.erc721s, erc20._id, erc20);
    }

    @Mutation
    setToken(token: TERC721Token) {
        Vue.set(this.tokens, token._id, token);
    }

    @Mutation
    setMetadata({ tokenId, metadata }: { tokenId: string; metadata: TERC721Metadata }) {
        Vue.set(this.metadata, tokenId, metadata);
    }

    @Mutation
    setBalance(payload: { erc721: ERC721; balance: string }) {
        Vue.set(this.erc721s[payload.erc721._id], 'balance', payload.balance);
    }

    @Action({ rawError: true })
    async balanceOf(erc721: ERC721) {
        const profile = this.context.rootGetters['account/profile'];
        const balance = await erc721.contract.methods.balanceOf(profile.address).call();

        this.context.commit('setBalance', { erc721, balance });
    }

    @Action({ rawError: true })
    async list() {
        const data = await thxClient.erc721.list({ chainId: this.context.rootGetters['network/chainId'] });

        await Promise.all(
            data.map(async (token: TERC721Token) => {
                try {
                    const web3 = this.context.rootState.network.web3;
                    const from = this.context.rootGetters['account/profile'].address;

                    token.erc721.blockExplorerUrl = `${chainInfo[token.erc721.chainId].blockExplorer}/token/${
                        token.erc721.address
                    }`;
                    token.erc721.logoURI = `https://avatars.dicebear.com/api/identicon/${token.erc721._id}.svg`;
                    token.erc721.contract = new web3.eth.Contract(ERC721Abi as any, token.erc721.address, { from });

                    this.context.commit('setToken', token);
                } catch (error) {
                    // Fail silent and do not break exec chain
                }
            }),
        );
    }

    @Action({ rawError: true })
    async getToken(id: string) {
        try {
            const data = await thxClient.erc721.get(id);

            const token = data;
            const web3 = this.context.rootState.network.web3;
            const from = this.context.rootGetters['account/profile'].address;

            token.erc721.blockExplorerUrl = `${chainInfo[token.erc721.chainId].blockExplorer}/token/${
                token.erc721.address
            }`;
            token.erc721.logoURI = `https://avatars.dicebear.com/api/identicon/${token.erc721._id}.svg`;
            token.erc721.contract = new web3.eth.Contract(ERC721Abi as any, token.erc721.address, { from });

            return token;
        } catch (error) {
            return { error };
        }
    }

    @Action({ rawError: true })
    async get(id: string) {
        const data = await thxClient.erc721.getContract(id);

        const web3 = this.context.rootState.network.web3;
        const from = this.context.rootGetters['account/profile'].address;
        const contract = new web3.eth.Contract(ERC721Abi as any, data.address, {
            from,
        });
        const erc721 = {
            ...data,
            contract,
            balance: 0,
            blockExplorerUrl: `${chainInfo[data.chainId].blockExplorer}/token/${data.address}`,
            logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
        };

        this.context.commit('set', erc721);
        this.context.dispatch('balanceOf', erc721);
    }

    @Action({ rawError: true })
    async getMetadata(token: TERC721Token) {
        const data = await thxClient.erc721.getMetadata(token.erc721Id, token.metadataId);
        this.context.commit('setMetadata', { tokenId: token._id, metadata: data });
    }
}

export default ERC721Module;
