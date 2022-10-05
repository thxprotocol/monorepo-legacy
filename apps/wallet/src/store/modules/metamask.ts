import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { toHex } from 'web3-utils';
import { default as defaultPoolDiamondAbi } from '@thxnetwork/artifacts/dist/exports/abis/defaultPoolDiamond.json';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { soliditySha3 } from 'web3-utils';

@Module({ namespaced: true })
class MetamaskStore extends VuexModule {
    account = '';
    chainId: number | null = null;
    web3: Web3 | null = null;

    get isConnected() {
        return !!this.account;
    }

    @Mutation
    setAccount({ accounts, currentAccount }: { accounts: string[]; currentAccount?: string }) {
        if (!accounts) {
            this.account = '';
            sessionStorage.removeItem('thx:wallet:metamask:currentAccount');
            return;
        }

        const keepAccount = currentAccount || this.account;
        if (!this.account || !keepAccount || !accounts.includes(keepAccount)) {
            this.account = accounts.includes(keepAccount) ? keepAccount : accounts[0];
            sessionStorage.setItem('thx:wallet:metamask:currentAccount', this.account);
        }
    }

    @Mutation
    setChainId(chainId: number) {
        this.chainId = chainId;
    }

    @Mutation
    setWeb3(web3: Web3) {
        this.web3 = web3;
    }

    @Action({ rawError: true })
    async approve(payload: { amount: string; tokenAddress: string; spender: string }) {
        if (!this.web3) return;
        const contract = new this.web3.eth.Contract(ERC20Abi as any, payload.tokenAddress);
        const allowance = await contract.methods.allowance(this.account, payload.spender).call({ from: this.account });

        if (Number(allowance) < Number(payload.amount)) {
            const receipt = await contract.methods
                .approve(payload.spender, payload.amount)
                .send({ from: this.account });
            console.log(receipt);
        }
    }

    @Action
    async connect(currentAccount = '') {
        const provider = (window as any).ethereum || ((window as any).web3 && (window as any).web3.currentProvider);

        try {
            if (provider.request) {
                const accounts = await provider.request({
                    method: 'eth_requestAccounts',
                });

                this.context.commit('setAccount', { accounts, currentAccount });

                const chainId = await provider.request({ method: 'eth_chainId' });
                this.context.commit('setChainId', parseInt(chainId, 16));

                provider.on('accountsChanged', (accounts: string[]) => {
                    this.context.commit('setAccount', accounts);
                });

                provider.on('chainChanged', (chainId: string) => {
                    this.context.commit('setChainId', parseInt(chainId, 16));
                });

                this.context.commit('setWeb3', new Web3(provider));
            }
        } catch (err) {
            if ((err as any).code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        }
    }

    @Action
    checkPreviouslyConnected() {
        if (this.isConnected) return;

        const currentAccount = sessionStorage.getItem('thx:wallet:metamask:currentAccount') as string;
        if (currentAccount) {
            this.context.dispatch('connect', currentAccount);
        }
    }

    @Action
    requestSwitchNetwork(chainId: number) {
        const provider = this.web3?.currentProvider as any;
        provider?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: toHex(chainId) }],
        });
    }

    @Action({ rawError: true })
    async sign(payload: { poolAddress: string; method: string; params: any[] }) {
        if (!this.web3) return;

        const solution = new this.web3.eth.Contract(defaultPoolDiamondAbi as any, payload.poolAddress, {
            from: this.account,
        });
        const abi: any = defaultPoolDiamondAbi.find(fn => fn.name === payload.method);
        const nonce = Number(await solution.methods.getLatestNonce(this.account).call()) + 1;
        const call = this.web3.eth.abi.encodeFunctionCall(abi, payload.params);
        const hash = soliditySha3(call, nonce) || '';
        const provider = this.web3?.currentProvider as any;
        const sig = await provider.request({
            method: 'eth_sign',
            params: [this.account, hash],
        });

        return {
            call,
            nonce,
            sig,
        };
    }
}

export default MetamaskStore;
