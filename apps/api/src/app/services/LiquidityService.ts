import { contractNetworks } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '../models/Wallet';
import { contractArtifacts, getAbiForContractName, getContract } from './ContractService';
import { ethers } from 'ethers';
import { getProvider } from '../util/network';

export default class LiquidityService {
    static async stake(wallet: WalletDocument, amountInWei: string) {
        // await vault.populateTransaction.joinPool(BALANCER_POOL_ID, wallet.address, wallet.address, {
        //     assets: [USDC_ADDRESS],
        //     maxAmountsIn,
        //     userData: JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
        //     fromInternalBalance: false,
        // });
        // Propose tx data to relayer and return safeTxHash to client to sign
        // return await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);
    }
}
