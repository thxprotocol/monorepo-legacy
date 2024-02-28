import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardNFTPaymentDocument = mongoose.Document & TRewardCoinPayment;

export const RewardNFTPayment = mongoose.model<RewardNFTPaymentDocument>(
    'RewardNFTPayment',
    new mongoose.Schema(
        {
            ...rewardPaymentSchema,
        },
        { timestamps: true },
    ),
    'rewardnftpayment',
);
