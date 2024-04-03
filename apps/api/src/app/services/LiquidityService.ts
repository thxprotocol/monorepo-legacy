import { contractNetworks } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '../models/Wallet';
import { contractArtifacts } from './ContractService';
import { getProvider } from '../util/network';
import { BALANCER_POOL_ID } from '../config/secrets';
import TransactionService from './TransactionService';

export default class LiquidityService {
    static async create(wallet: WalletDocument, usdcAmountInWei: string, thxAmountInWei: string, slippage: string) {
        const { web3 } = getProvider(wallet.chainId);

        const { BalancerVault, THX, USDC } = contractNetworks[wallet.chainId];

        // Deposit the BPT into the gauge
        const balancerVault = new web3.eth.Contract(contractArtifacts['BalancerVault'].abi, BalancerVault);

        const joinPoolRequest = {
            assets: [USDC, THX],
            maxAmountsIn: [usdcAmountInWei, thxAmountInWei], // TODO include slippage
            userData: '0x',
            fromInternalBalance: false,
        };

        const fn = balancerVault.methods.joinPool(BALANCER_POOL_ID, wallet.address, wallet.address, joinPoolRequest);

        // Propose tx data to relayer and return safeTxHash to client to sign
        return await TransactionService.sendSafeAsync(wallet, balancerVault.options.address, fn);
    }

    static async stake(wallet: WalletDocument, amountInWei: string) {
        const { web3 } = getProvider(wallet.chainId);

        // Deposit the BPT into the gauge
        const bptGauge = new web3.eth.Contract(
            contractArtifacts['BPTGauge'].abi,
            contractNetworks[wallet.chainId].BPTGauge,
        );
        const fn = bptGauge.methods.deposit(amountInWei);

        // Propose tx data to relayer and return safeTxHash to client to sign
        return await TransactionService.sendSafeAsync(wallet, bptGauge.options.address, fn);
    }
}
