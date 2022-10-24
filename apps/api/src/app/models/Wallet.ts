import mongoose from 'mongoose';
import { getAbiForContractName } from '../config/contracts';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '../types/enums';
import { getProvider } from '../util/network';
import { ContractName } from '@thxnetwork/contracts/exports';

export type WalletDocument = mongoose.Document & TWallet;
export interface TWallet {
    address: string;
    sub: string;
    chainId: ChainId;
    contract: Contract;
    contractName: ContractName;
}

const walletSchema = new mongoose.Schema({
    address: String,
    sub: String,
    chainId: Number,
});

walletSchema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getAbiForContractName('SharedWallet');
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

walletSchema.virtual('contractName').get(function () {
    return 'SharedWallet';
});

export default mongoose.model<WalletDocument>('wallet', walletSchema);
