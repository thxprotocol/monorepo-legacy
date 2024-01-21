import { BigNumber } from 'ethers';
import { WalletDocument } from '../models/Wallet';
import { getProvider } from '@thxnetwork/api/util/network';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { SC_ADDRESS, VE_ADDRESS } from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { ChainId } from '@thxnetwork/common/lib/types';

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
    const fn = BigNumber.from(lock.amount).eq(0)
        ? ve.methods.create_lock(amountInWei, endTimestamp)
        : ve.methods.increase_amount(amountInWei);

    // Propose tx data to relayer and return safeTxHash to client to sign
    return await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);
}

function withdraw() {
    //
}

export default { isApprovedAddress, approve, getAllowance, deposit, withdraw };
