import { BigNumber, ContractInterface, ethers } from 'ethers';
import { getAbiForContractName } from '../config/contracts';
import TransactionService from './TransactionService';
import { WalletDocument } from '../models/Wallet';

const USDC_ADDRESS = '';
const COMPANY_SAFE_ADDRESS = '';
const BALANCER_VAULT_ADDRESS = '';
const BALANCER_POOL_ID = '';

enum JoinKind {
    INIT,
    EXACT_TOKENS_IN_FOR_BPT_OUT,
    TOKEN_IN_FOR_EXACT_BPT_OUT,
    ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
}

// joinPool(
//     bytes32 poolId,
//     address sender,
//     address recipient,
//     JoinPoolRequest request
// )

// struct JoinPoolRequest {
//     address[] assets,
//     uint256[] maxAmountsIn,
//     bytes userData,
//     bool fromInternalBalance
// }

async function joinPool(wallet: WalletDocument, maxAmountsIn: BigNumber[]) {
    const vault = new ethers.Contract(
        BALANCER_VAULT_ADDRESS,
        getAbiForContractName('BalancerVault') as unknown as ContractInterface,
    );

    await vault.populateTransaction.joinPool(BALANCER_POOL_ID, wallet.address, wallet.address, {
        assets: [USDC_ADDRESS],
        maxAmountsIn,
        userData: JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
        fromInternalBalance: false,
    });

    // Propose tx data to relayer and return safeTxHash to client to sign
    return await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);
}

export { JoinKind, USDC_ADDRESS, COMPANY_SAFE_ADDRESS, BALANCER_VAULT_ADDRESS, BALANCER_POOL_ID };
export default { joinPool };
