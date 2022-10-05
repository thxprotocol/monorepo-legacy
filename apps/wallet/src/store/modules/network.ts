import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { isPrivateKey, send } from '@thxnetwork/wallet/utils/network';
import { HARDHAT_RPC, POLYGON_MUMBAI_RPC, POLYGON_RPC } from '@thxnetwork/wallet/utils/secrets';
import { fromWei, toWei } from 'web3-utils';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import axios from 'axios';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/LimitedSupplyToken.json';
import { TPayment } from '@thxnetwork/wallet/types/Payments';

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

@Module({ namespaced: true })
class NetworkModule extends VuexModule {
    _networks: { [npid: number]: Web3 } = {
        [ChainId.Hardhat]: new Web3(HARDHAT_RPC),
        [ChainId.PolygonMumbai]: new Web3(POLYGON_MUMBAI_RPC),
        [ChainId.Polygon]: new Web3(POLYGON_RPC),
    };

    get all() {
        return this._networks;
    }

    @Mutation
    setConfig({ chainId, privateKey }: TNetworkConfig) {
        const network = this._networks[chainId];
        const admin = network.eth.accounts.privateKeyToAccount(privateKey);

        network.eth.accounts.wallet.add(admin);
        network.eth.defaultAccount = admin.address;
    }

    @Action({ rawError: true })
    async sendValue({ web3, to, amount }: { web3: Web3; to: string; amount: string }) {
        const value = toWei(amount);
        const gas = await web3.eth.estimateGas({ to, value });
        const tx = await web3.eth.sendTransaction({ gas, to, value });

        return { tx };
    }

    @Action({ rawError: true })
    async setNetwork(config: { chainId: ChainId; privateKey: string }) {
        if (isPrivateKey(config.privateKey)) {
            this.context.commit('setConfig', config);
        }
    }

    @Action({ rawError: true })
    async approve(payment: TPayment) {
        const web3: Web3 = this._networks[payment.chainId];
        const profile = this.context.rootGetters['account/profile'];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const balance = Number(fromWei(await web3.eth.getBalance(profile.address)));

        if (balance === 0) {
            await axios({
                method: 'POST',
                url: `/deposits/approve`,
                headers: {
                    'X-PoolId': payment.poolId,
                },
                data: {
                    amount: payment.amount,
                },
            });
        }

        const tokenContract = new web3.eth.Contract(ERC20Abi as any, payment.tokenAddress);
        const receipt = await send(
            web3,
            payment.tokenAddress,
            tokenContract.methods.approve(payment.receiver, payment.amount),
            privateKey,
        );

        return receipt;
    }
}

export default NetworkModule;
