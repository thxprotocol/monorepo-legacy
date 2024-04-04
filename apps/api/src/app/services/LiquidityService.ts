import { contractNetworks } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '../models/Wallet';
import { contractArtifacts } from './ContractService';
import { getProvider } from '../util/network';
import TransactionService from './TransactionService';
import BalancerService from './BalancerService';

export default class LiquidityService {
    static async create(wallet: WalletDocument, usdcAmountInWei: string, thxAmountInWei: string, slippage: string) {
        const { to, data } = await BalancerService.buildJoin(wallet, usdcAmountInWei, thxAmountInWei, slippage);
        return await TransactionService.proposeSafeAsync(wallet, to, data);
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
