import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { isPrivateKey, MINIMUM_GAS_LIMIT } from '@thxnetwork/wallet/utils/network';
import {
    HARDHAT_RPC,
    NODE_ENV,
    POLYGON_MUMBAI_RPC,
    POLYGON_RPC,
    TORUS_VERIFIER,
} from '@thxnetwork/wallet/utils/secrets';
import { fromWei, toWei } from 'web3-utils';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { toHex, toChecksumAddress } from 'web3-utils';
import { mockPrivateKeyForSubject, torusClient } from '@thxnetwork/wallet/utils/torus';
import { User } from 'oidc-client-ts';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import { ChainInfo } from '@thxnetwork/wallet/types/ChainInfo';
import { AccountVariant } from '@thxnetwork/wallet/types/Accounts';
import { TorusKey } from '@toruslabs/customauth';
import { createTypedMessage } from '@thxnetwork/wallet/utils/typedData';

export type TNetworkConfig = {
    chainId: ChainId;
    privateKey: string;
};

export type TNetworks = {
    [ChainId.BinanceSmartChain]: Web3;
    [ChainId.Ethereum]: Web3;
    [ChainId.Arbitrum]: Web3;
    [ChainId.Hardhat]: Web3;
    [ChainId.PolygonMumbai]: Web3;
    [ChainId.Polygon]: Web3;
};

const networks = {
    [ChainId.BinanceSmartChain]: '',
    [ChainId.Ethereum]: '',
    [ChainId.Arbitrum]: '',
    [ChainId.Hardhat]: HARDHAT_RPC,
    [ChainId.PolygonMumbai]: POLYGON_MUMBAI_RPC,
    [ChainId.Polygon]: POLYGON_RPC,
};

const ethereum = (window as any).ethereum;
const isMetamaskInstalled = typeof ethereum !== undefined;

@Module({ namespaced: true })
class NetworkModule extends VuexModule {
    web3: Web3 = new Web3(networks[ChainId.Polygon]);
    privateKey = '';
    address = '';
    _chainId: ChainId = ChainId.Polygon;

    get chainId() {
        // const chainId = Number(localStorage.getItem(`thx:wallet:chain-id`));
        // if (Object.values(ChainId).includes(chainId)) return chainId;
        return this._chainId;
    }

    get chains() {
        return Object.values(chainInfo)
            .filter((chain: ChainInfo) => {
                if (NODE_ENV === 'production' && chain.chainId === ChainId.Hardhat) return;
                if (!chain.disabled) return chain;
            })
            .sort((a: ChainInfo, b: ChainInfo) => {
                return a.name > b.name ? 1 : -1;
            });
    }

    @Mutation
    setWeb3({ web3, privateKey }: { web3: Web3; privateKey?: string }) {
        this.web3 = web3;

        if (privateKey) {
            const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            this.web3.eth.accounts.wallet.add(account);
            this.web3.eth.defaultAccount = account.address;
            this.address = toChecksumAddress(account.address);
        }
    }

    @Mutation
    setAddress(address: string) {
        this.address = toChecksumAddress(address);
    }

    @Mutation
    setChainId(chainId: ChainId) {
        this._chainId = chainId;
        localStorage.setItem(`thx:wallet:chain-id`, String(chainId));
    }

    @Mutation
    setPrivateKey(privateKey: string) {
        this.privateKey = privateKey;
    }

    @Action({ rawError: true })
    async getPrivateKey(user: User) {
        // Early return for metamask users, they will bring their own
        if (user.profile.variant === AccountVariant.Metamask) return;

        // Fetch key from mockdata in localstorage
        if (NODE_ENV === 'development') {
            this.context.commit('setPrivateKey', mockPrivateKeyForSubject(user.profile.sub));
            return;
        }

        // Other cases should fetch their key from Torus
        const torusKey: TorusKey = await torusClient.getTorusKey(
            TORUS_VERIFIER,
            user.profile.sub,
            { verifier_id: user.profile.sub },
            user.access_token,
        );
        this.context.commit('setPrivateKey', `0x${torusKey.privateKey}`);
    }

    @Action({ rawError: true })
    async connect(chainId: ChainId) {
        const user = this.context.rootGetters['account/user'];
        const isValidPrivateKey = this.privateKey && isPrivateKey(this.privateKey);
        const isMetamaskAccount = user ? user.profile.variant === AccountVariant.Metamask : false;
        const web3 =
            user && !isMetamaskAccount
                ? // Use a local web3 instance as per requested chainId
                  new Web3(networks[chainId])
                : // Bind window.ethereum as provider
                  new Web3(ethereum);

        this.context.commit('setChainId', chainId);
        this.context.commit('setWeb3', { web3, privateKey: this.privateKey });

        // If private key is not available for a non Metamask account then request new access
        // credentials and fetch key
        if (user && !isMetamaskAccount) {
            if (!isValidPrivateKey) {
                await this.context.dispatch('account/signinRedirect', {}, { root: true });
            }
            return;
        }

        // If metamask is available request to switch chain if required
        if (isMetamaskInstalled) {
            await this.context.dispatch('requestAccounts', user);
            await this.context.dispatch('requestSwitchChain', chainId);
        }
    }

    @Action({ rawError: true })
    async requestAccounts(user?: User) {
        try {
            const provider = this.web3?.currentProvider as any;
            const [account] = await provider.request({
                method: 'eth_requestAccounts',
            });
            this.context.commit('setAddress', account);

            if (user && this.address !== user.profile.address) {
                throw new Error(
                    `Selected Metamask account ${this.address} does not equal the account used during signup.`,
                );
            }
        } catch (error) {
            if ((error as { code: number }).code === 4001) {
                throw new Error(`Please connect Metamask account`);
            } else {
                throw error;
            }
        }
    }

    @Action({ rawError: true })
    async requestSwitchChain(chainId: ChainId) {
        const provider = this.web3?.currentProvider as any;

        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: toHex(chainId) }],
            });
        } catch (error) {
            if ((error as { code: number }).code === 4001) {
                throw new Error(`Please select ${chainInfo[chainId].name} RPC`);
            } else {
                throw error;
            }
        }
    }

    @Action({ rawError: true })
    async sign(msg: string) {
        if (this.privateKey) {
            const hash = '';
            return this.web3.eth.accounts.sign(hash as string, this.privateKey).signature;
        } else {
            const nonce = await this.web3.eth.getTransactionCount(this.address);
            const message = createTypedMessage(msg, 'THX Web Wallet', String(nonce), this.chainId);
            const provider = this.web3?.currentProvider as any;
            const signature = await provider.request({
                method: 'eth_signTypedData_v4',
                params: [this.address, message],
                from: this.address,
            });

            return { signature, message };
        }
    }

    @Action({ rawError: true })
    async send({ to, fn }: { to: string; fn: any }) {
        const gasPrice = await this.web3.eth.getGasPrice();
        const from = this.address;
        const data = fn.encodeABI();
        const estimate = await fn.estimateGas();
        const gas = String(estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate);

        if (this.privateKey) {
            const sig = await this.web3.eth.accounts.signTransaction(
                {
                    gas,
                    gasPrice,
                    to,
                    from,
                    data,
                },
                this.privateKey,
            );

            if (sig.rawTransaction) {
                return await this.web3.eth.sendSignedTransaction(sig.rawTransaction);
            }
        } else {
            try {
                const provider = this.web3?.currentProvider as any;

                return await provider.request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            gas,
                            gasPrice,
                            to,
                            from,
                            data,
                        },
                    ],
                });
            } catch (error) {
                // TODO Check for error.code and return appropriately
                console.error(error);
            }
        }
    }

    @Action({ rawError: true })
    async sendValue({ web3, to, amount }: { web3: Web3; to: string; amount: string }) {
        const value = toWei(amount);
        const gas = await web3.eth.estimateGas({ to, value });
        const tx = await web3.eth.sendTransaction({ gas, to, value });

        return { tx };
    }

    @Action({ rawError: true })
    async getBalance() {
        const profile = this.context.rootGetters['account/profile'];
        return Number(fromWei(await this.web3.eth.getBalance(profile.address)));
    }
}

export default NetworkModule;
