import mongoose from 'mongoose';

export type TransactionDocument = mongoose.Document & TTransaction;

export const Transaction = mongoose.model<TransactionDocument>(
    'Transaction',
    new mongoose.Schema(
        {
            from: String,
            to: String,
            nonce: Number,
            walletId: String,
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
    ),
    'transaction',
);
