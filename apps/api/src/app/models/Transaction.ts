import mongoose from 'mongoose';

export type TransactionDocument = mongoose.Document & TTransaction;

const transactionSchema = new mongoose.Schema(
    {
        id: String,
        from: String,
        to: String,
        nonce: Number,
        walletId: { type: String, index: 'hashed' },
        transactionId: String,
        transactionHash: String,
        safeTxHash: String,
        gas: String,
        baseFee: String,
        maxFeePerGas: String,
        maxPriorityFeePerGas: String,
        type: Number,
        state: { type: Number, index: { sparse: true } },
        call: { fn: String, args: String },
        chainId: Number,
        failReason: String,
        callback: {},
    },
    { timestamps: true },
);

export const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);
