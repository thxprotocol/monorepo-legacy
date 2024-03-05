import mongoose from 'mongoose';

export type RewardCoinPaymentDocument = mongoose.Document & TRewardCoinPayment;

export const RewardCoinPayment = mongoose.model<RewardCoinPaymentDocument>(
    'RewardCoinPayment',
    new mongoose.Schema(
        {
            rewardId: String,
            sub: String,
            poolId: String,
            amount: Number,
        },
        { timestamps: true },
    ),
    'rewardcoinpayment',
);
