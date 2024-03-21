import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardGalachainPaymentDocument = mongoose.Document & TRewardGalachainPayment;

export const RewardGalachainPayment = mongoose.model<RewardGalachainPaymentDocument>(
    'RewardGalachainPayment',
    new mongoose.Schema(
        {
            ...rewardPaymentSchema,
            amount: String,
        },
        { timestamps: true },
    ),
    'rewardgalachainpayment',
);
