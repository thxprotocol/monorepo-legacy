import { BigNumber } from 'ethers';
import { getProvider } from '@thxnetwork/api/util/network';
import { SC_ADDRESS, VE_ADDRESS } from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { ChainId } from '@thxnetwork/common/enums';
import { WalletDocument, TransactionDocument } from '@thxnetwork/api/models';
import TransactionService from '@thxnetwork/api/services/TransactionService';

async function isApprovedAddress(address: string) {
    const { web3 } = getProvider();
    const whitelist = new web3.eth.Contract(contractArtifacts['SmartWalletWhitelist'].abi, SC_ADDRESS);
    return await whitelist.methods.check(address).call();
}

async function getAllowance(wallet: WalletDocument, tokenAddress: string, spender: string) {
    const { web3 } = getProvider(ChainId.Hardhat);
    const bpt = new web3.eth.Contract(contractArtifacts['BPTToken'].abi, tokenAddress);
    return await bpt.methods.allowance(wallet.address, spender).call();
}

async function approve(wallet: WalletDocument, tokenAddress: string, spender: string, amount: string) {
    const { web3 } = getProvider(ChainId.Hardhat);
    const bpt = new web3.eth.Contract(contractArtifacts['BPTToken'].abi, tokenAddress);
    const fn = bpt.methods.approve(spender, amount);

    // Propose tx data to relayer and return safeTxHash to client to sign
    return await TransactionService.sendSafeAsync(wallet, bpt.options.address, fn);
}

async function deposit(wallet: WalletDocument, amountInWei: string, endTimestamp: number) {
    const { web3 } = getProvider(ChainId.Hardhat);
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, VE_ADDRESS);

    // Check for lock and determine ve fn to call
    const lock = await ve.methods.locked(wallet.address).call();
    const isLocked = BigNumber.from(lock.amount).gt(0);

    // Define helpers
    const createLock = () => {
        console.log(amountInWei, endTimestamp, 'create_lock');
        const fn = ve.methods.create_lock(amountInWei, endTimestamp);
        return TransactionService.sendSafeAsync(wallet, VE_ADDRESS, fn);
    };
    const increaseAmount = () => {
        console.log(amountInWei, 'increase_amount');
        const fn = ve.methods.increase_amount(amountInWei);
        return TransactionService.sendSafeAsync(wallet, VE_ADDRESS, fn);
    };
    const increaseUnlockTime = () => {
        console.log(endTimestamp, 'increase_unlock_time');
        const fn = ve.methods.increase_unlock_time(endTimestamp);
        return TransactionService.sendSafeAsync(wallet, VE_ADDRESS, fn);
    };

    // Build tx array
    const transactions: TransactionDocument[] = [];
    if (!isLocked) {
        transactions.push(await createLock());
    }

    // If there is a lock and amount is > 0
    if (isLocked && BigNumber.from(amountInWei).gt(0)) {
        transactions.push(await increaseAmount());
    }

    // If there a lock and endTimestamp is > lock.end
    if (isLocked && endTimestamp > Number(lock.end)) {
        transactions.push(await increaseUnlockTime());
    }

    // Propose safeTxHashes to client to sign
    return transactions;
}

async function withdraw(wallet: WalletDocument, isEarlyWithdraw: boolean) {
    const { web3 } = getProvider();
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, VE_ADDRESS);

    // Check for lock and determine ve function to call
    const fn = isEarlyWithdraw ? ve.methods.withdraw_early() : ve.methods.withdraw();

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);

    return [tx];
}

export default { isApprovedAddress, approve, getAllowance, deposit, withdraw };
