import mongoose from 'mongoose';

export type RewardCoinPaymentDocument = mongoose.Document & TRewardCoinPayment;

const schema = new mongoose.Schema(
    {
        rewardId: String,
        sub: String,
        poolId: String,
        amount: Number,
    },
    { timestamps: true },
);

export const RewardCoinPayment = mongoose.model<RewardCoinPaymentDocument>('erc20perkpayments', schema);
