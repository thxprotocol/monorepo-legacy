import mongoose from 'mongoose';
import { rewardSchema } from './Reward';

export type RewardNFTPaymentDocument = mongoose.Document & TRewardCoinPayment;

export const RewardNFTPayment = mongoose.model<RewardNFTPaymentDocument>(
    'RewardNFTPayment',
    new mongoose.Schema(
        {
            ...rewardSchema,
        },
        { timestamps: true },
    ),
    'rewardnftpayment',
);
