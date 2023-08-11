import mongoose from 'mongoose';
import { TWithdrawal } from '@thxnetwork/api/types/TWithdrawal';

export type WithdrawalDocument = mongoose.Document & TWithdrawal;

const withdrawalSchema = new mongoose.Schema(
    {
        state: Number,
        type: Number,
        erc20Id: String,
        sub: String,
        amount: Number,
        beneficiary: String,
        transactions: [String],
        walletId: { type: String, index: 'hashed' },
    },
    { timestamps: true },
);
export const Withdrawal = mongoose.model<WithdrawalDocument>('Withdrawal', withdrawalSchema);
