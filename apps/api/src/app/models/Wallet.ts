import mongoose from 'mongoose';

export type WalletDocument = mongoose.Document & TWallet;

const walletSchema = new mongoose.Schema(
    {
        uuid: String,
        expiresAt: Date,
        poolId: String,
        address: String,
        sub: { type: String, index: 'hashed' },
        chainId: Number,
        version: String,
        safeVersion: String,
        variant: String,
    },
    { timestamps: true },
);

export const Wallet = mongoose.model<WalletDocument>('wallet', walletSchema);
