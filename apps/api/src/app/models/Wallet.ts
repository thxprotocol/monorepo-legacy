import mongoose from 'mongoose';
import { getDiamondAbi } from '../config/contracts';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '../types/enums';
import { getProvider } from '../util/network';

export type WalletDocument = mongoose.Document & TWallet;
export interface TWallet {
    address: string;
    sub: string;
    chainId: ChainId;
    contract: Contract;
}

const walletSchema = new mongoose.Schema(
    {
        address: String,
        sub: String,
        chainId: Number,
    },
    { timestamps: true },
);

walletSchema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getDiamondAbi(this.chainId, 'sharedWallet');
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

export default mongoose.model<WalletDocument>('wallet', walletSchema);
