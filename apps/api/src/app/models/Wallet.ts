import mongoose from 'mongoose';
import { getDiamondAbi } from '../config/contracts';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '@thxnetwork/types/enums';
import { getProvider } from '../util/network';

export type WalletDocument = mongoose.Document & TWallet;
export interface TWallet {
    _id: string;
    address: string;
    sub: string;
    chainId: ChainId;
    contract: Contract;
    version: string;
    isUpgradeAvailable: boolean;
}

const walletSchema = new mongoose.Schema(
    {
        address: String,
        sub: String,
        chainId: Number,
        version: String,
    },
    { timestamps: true },
);

walletSchema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getDiamondAbi(this.chainId, 'sharedWallet');
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

export const Wallet = mongoose.model<WalletDocument>('wallet', walletSchema);
