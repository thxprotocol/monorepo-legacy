import mongoose from 'mongoose';

export type RewardNFTPaymentDocument = mongoose.Document & TRewardCoinPayment;

const schema = new mongoose.Schema(
    {
        rewardId: String,
        sub: { type: String, index: 'hashed' },
        poolId: String,
        amount: Number,
    },
    { timestamps: true },
);

export const RewardNFTPayment = mongoose.model<RewardNFTPaymentDocument>('RewardNFTPayments', schema);
