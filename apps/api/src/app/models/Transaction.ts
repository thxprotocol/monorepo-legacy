import { TTransaction } from '@thxnetwork/api/types/TTransaction';
import mongoose from 'mongoose';

export type TransactionDocument = mongoose.Document & TTransaction;

const transactionSchema = new mongoose.Schema(
    {
        id: String,
        from: String,
        to: String,
        nonce: Number,
        transactionId: String,
        transactionHash: String,
        gas: String,
        baseFee: String,
        maxFeePerGas: String,
        maxPriorityFeePerGas: String,
        type: Number,
        state: Number,
        call: { fn: String, args: String },
        chainId: Number,
        failReason: String,
    },
    { timestamps: true },
);

export const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);
